"use client";

import { isTextUIPart, isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import { GitBranchIcon, SparklesIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";

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
 * a loading indicator while a response is pending. Assistant replies carry a
 * turmeric accent edge, user messages a soft sage tint — the same two
 * "branches" from the landing page, here marking who's speaking.
 */
export function ChatMessages({ messages, status, onBranch }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="mx-auto max-w-3xl py-8">
        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          return (
            <div
              key={message.id}
              className="group/row animate-in fade-in slide-in-from-bottom-1 fill-mode-both mb-6 flex gap-3"
              style={{ animationDelay: `${Math.min(index, 4) * 40}ms`, animationDuration: "400ms" }}
            >
              {isAssistant ? (
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <SparklesIcon className="size-3.5" />
                </div>
              ) : (
                <div className="w-7 shrink-0" />
              )}

              <div className={cn("relative min-w-0 flex-1", !isAssistant && "flex justify-end")}>
                <Message from={message.role} className="relative !w-auto max-w-full">
                  <MessageContent
                    className={cn(
                      isAssistant
                        ? "border-l-2 border-primary/40 bg-transparent pl-4"
                        : "rounded-2xl bg-[color-mix(in_oklab,var(--sage)_16%,var(--card))] px-4 py-2.5"
                    )}
                  >
                    {isAssistant ? (
                      <AssistantParts message={message} />
                    ) : (
                      <MessageResponse>{getMessageText(message)}</MessageResponse>
                    )}
                  </MessageContent>
                </Message>

                <button
                  type="button"
                  onClick={() => onBranch(message.id)}
                  title="Branch from here"
                  className={cn(
                    "absolute -top-2 flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity duration-150 hover:text-primary group-hover/row:opacity-100",
                    isAssistant ? "left-2" : "right-2"
                  )}
                >
                  <GitBranchIcon className="size-3" />
                  Branch
                </button>
              </div>
            </div>
          );
        })}

        {isWaiting ? (
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <SparklesIcon className="size-3.5 animate-pulse" />
            </div>
            <Message from="assistant">
              <MessageContent className="border-l-2 border-primary/40 bg-transparent pl-4">
                <Loader />
              </MessageContent>
            </Message>
          </div>
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