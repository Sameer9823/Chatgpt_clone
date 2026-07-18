"use client";
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from "@ai-sdk/react"
import React, { useMemo, useState } from 'react'
import { useConversations } from '../hooks/use-conversation';
import { useCreateBranch } from '../hooks/use-branches';
import { queryKeys } from '../utils/query-keys';
import { toast } from 'sonner';
import { ChatEmpty } from './chat-empty';
import { ChatMessages } from './chat-messages';
import { ChatComposer } from './chat-composer';
import { BranchNav } from './branch-nav';

type ConversationViewProps = {
    conversationId: string;
    initialMessages: UIMessage[];
};

/**
 * Main chat view — header, message list (or empty state), and composer with streaming.
 */
export const ConversationView = ({ conversationId, initialMessages }: ConversationViewProps) => {

    const queryClient = useQueryClient();
    const { data: conversations } = useConversations();
    const createBranch = useCreateBranch(conversationId);
    const [draft, setDraft] = useState("");

    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }), []);

    const { messages, sendMessage, status } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    })
    const title =
    conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

    /** Opens a branch from the given message, prompting for an optional name. */
    function handleBranch(messageId: string) {
        const name = window.prompt("Name this branch (optional)");
        createBranch.mutate({ messageId, name: name ?? undefined });
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-3 backdrop-blur-md">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mx-1 h-4" />
                <h1 className="flex-1 truncate text-sm font-medium">{title}</h1>
                <BranchNav conversationId={conversationId} />
            </header>

            {messages.length === 0 ? (
                <ChatEmpty onPick={(prompt) => setDraft(prompt)} />
            ) : (
                <ChatMessages messages={messages} status={status} onBranch={handleBranch} />
            )}

            <ChatComposer
                value={draft}
                onValueChange={setDraft}
                onSend={(text) => {
                    void sendMessage({ text });
                    setDraft("");
                }}
                isSending={status !== "ready"}
                autoFocus
            />
        </div>
    )
}