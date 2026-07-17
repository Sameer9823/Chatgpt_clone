import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { webSearch } from "@/features/ai/tools/web-search";

import { getChatModel, supportsWebSearch } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, type UIMessage } from "ai";

/** System prompt used when a conversation has no custom override and the model supports search. */
const DEFAULT_SYSTEM_PROMPT =
    "You are ChaiGpt, a helpful assistant. You have a webSearch tool for current events, " +
    "recent releases, prices, or anything you're not confident about or that may have changed " +
    "since your training. Call it automatically whenever it would help — don't ask permission " +
    "first. Cite what you find in your own words and mention where it came from.";

/** System prompt used when the selected model can't use the hosted web search tool. */
const DEFAULT_SYSTEM_PROMPT_NO_SEARCH =
    "You are ChaiGpt, a helpful assistant. You do not have web search available for this " +
    "conversation's model — don't claim to search the web or cite live sources. If a question " +
    "needs current information you can't verify, say so plainly.";

/**
 * POST /api/chat — Streams an AI assistant reply for a conversation.
 *
 * Validates auth and ownership, persists the user message, then streams the
 * assistant response via the AI SDK, letting the model call the web search
 * tool on its own before producing a final answer. Final messages (including
 * any tool calls/results) are saved when the stream ends.
 */
export async function POST(req: Request) {
    await auth.protect();

    const { message, id }: { message: UIMessage, id: string } = await req.json();

    if (!message || !id) {
        return new Response("Missing message or conversation id", { status: 400 });
    }

    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: user.id
        }
    });

    if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
    }

    const previousMessages = await loadChatMessages(id);

    const alreadySaved = previousMessages.some(
        (storedMessage)=>storedMessage.id === message.id
    )

    const messages = alreadySaved ? previousMessages : [...previousMessages, message];

    if(!alreadySaved){
        await saveChatMessages(id, [message]);
    }

    const canSearch = supportsWebSearch(conversation.model);

    const result =  streamText({
        model: getChatModel(conversation.model),
        system:
            conversation.systemPrompt ??
            (canSearch ? DEFAULT_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT_NO_SEARCH),
        messages: await convertToModelMessages(messages),
        // Only attach the hosted web search tool for models that support it —
        // attaching it for an unsupported model would error the whole request.
        tools: canSearch ? { web_search: webSearch } : undefined,
        // Allow the model to call a tool and then keep going to produce the
        // final answer, instead of stopping right after the tool call.
        stopWhen: isStepCount(5),
    });

    result.consumeStream();

    return createUIMessageStreamResponse({
        stream:toUIMessageStream({
           stream:result.stream,
           originalMessages:messages,
           generateMessageId:createIdGenerator({prefix:"msg" , size:16}),
           onEnd:async({messages:finalMessages})=>{
            try {
                // finalMessages includes any tool-call / tool-result parts,
                // so they're persisted alongside the text automatically.
                await saveChatMessages(id , finalMessages , {updateTitle:false})
            } catch (error) {
                console.error(error);
            }
           },
           onError: (error) => {
            console.error("Chat stream error:", error);
            return "Something went wrong while generating a response. Please try again.";
           },
        })
    })

}