"use client";

import { isTextUIPart, isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import { GitBranchIcon } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolState,
  type WebSearchToolOutput,
} from "./ai-elements";

/** Extracts plain text from a `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("");
}

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  onBranch: (messageId: string) => void;
};

/**
 * Renders the conversation message list — interleaving markdown text with
 * inline tool-call cards (e.g. web search) in the order they occurred — plus
 * a loading indicator while a response is pending. Hovering a message
 * reveals a "Branch" action to fork the conversation from that point.
 */
export function ChatMessages({ messages, status, onBranch }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <Message key={message.id} from={message.role} className="relative">
            <MessageContent>
              {message.role === "assistant" ? (
                <AssistantParts message={message} />
              ) : (
                <MessageResponse>{getMessageText(message)}</MessageResponse>
              )}
            </MessageContent>

            <button
              type="button"
              onClick={() => onBranch(message.id)}
              title="Branch from here"
              className="absolute -top-2 right-2 hidden items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm hover:text-foreground group-hover:flex"
            >
              <GitBranchIcon className="size-3" />
              Branch
            </button>
          </Message>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

/**
 * Renders an assistant message's parts in order: tool calls (e.g. web
 * search) render as collapsible cards, text parts render as markdown.
 */
function AssistantParts({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, index) => {
        if (isTextUIPart(part)) {
          return part.text ? (
            <MessageResponse key={`${message.id}-text-${index}`}>
              {part.text}
            </MessageResponse>
          ) : null;
        }

        if (isToolUIPart(part)) {
          const toolName = part.type.replace(/^tool-/, "");
          const state = part.state as ToolState;
          const output =
            "output" in part ? (part.output as WebSearchToolOutput) : undefined;
          const query =
            (part as { input?: { query?: string } }).input?.query ??
            output?.action?.query;

          return (
            <Tool key={part.toolCallId ?? `${message.id}-tool-${index}`}>
              <ToolHeader
                state={state}
                label={
                  toolName === "web_search"
                    ? undefined
                    : `Running ${toolName}…`
                }
              />
              <ToolContent>
                {query ? <ToolInput input={query} /> : null}
                {state === "output-available" || state === "output-error" ? (
                  <ToolOutput
                    output={output}
                    errorText={
                      "errorText" in part ? part.errorText : undefined
                    }
                  />
                ) : null}
              </ToolContent>
            </Tool>
          );
        }

        return null;
      })}
    </>
  );
}