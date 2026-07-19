"use client";

import * as React from "react";
import { isTextUIPart, isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";
import {
  CheckIcon,
  CopyIcon,
  GitBranchIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onBranch: (messageId: string, name?: string) => void;
  onRegenerate?: (messageId: string) => void;
};

/**
 * Renders the conversation message list — interleaving markdown text with
 * inline tool-call cards (e.g. web search) in the order they occurred — plus
 * a loading indicator while a response is pending. Every message carries a
 * persistent action row (copy / regenerate / branch) so branching is
 * discoverable, not hidden behind hover.
 */
export function ChatMessages({ messages, status, onBranch, onRegenerate }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <Conversation>
      <ConversationContent className="mx-auto max-w-3xl py-8">
        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          const isLastAssistant = message.id === lastAssistantId;

          return (
            <div
              key={message.id}
              className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both mb-7 flex gap-3"
              style={{ animationDelay: `${Math.min(index, 4) * 40}ms`, animationDuration: "400ms" }}
            >
              {isAssistant ? (
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <SparklesIcon className="size-3.5" />
                </div>
              ) : (
                <div className="w-7 shrink-0" />
              )}

              <div className={cn("min-w-0 flex-1", !isAssistant && "flex flex-col items-end")}>
                <Message from={message.role} className="relative !w-auto max-w-full">
                  <MessageContent
                    className={cn(
                      isAssistant
                        ? "border-l-2 border-primary/40 bg-transparent pl-4"
                        : "rounded-2xl bg-[#7E947326] px-4 py-2.5"
                    )}
                  >
                    {isAssistant ? (
                      <AssistantParts message={message} />
                    ) : (
                      <MessageResponse>{getMessageText(message)}</MessageResponse>
                    )}
                  </MessageContent>
                </Message>

                <MessageActions
                  messageId={message.id}
                  text={getMessageText(message)}
                  isAssistant={isAssistant}
                  showRegenerate={isAssistant && isLastAssistant && Boolean(onRegenerate)}
                  onBranch={onBranch}
                  onRegenerate={onRegenerate}
                />
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
 * Persistent (not hover-only) action row under each message: copy,
 * regenerate (last assistant reply only), and branch. Visible at low
 * opacity by default so branching stays discoverable, full opacity on
 * hover/focus.
 */
function MessageActions({
  messageId,
  text,
  isAssistant,
  showRegenerate,
  onBranch,
  onRegenerate,
}: {
  messageId: string;
  text: string;
  isAssistant: boolean;
  showRegenerate: boolean;
  onBranch: (messageId: string, name?: string) => void;
  onRegenerate?: (messageId: string) => void;
}) {
  const [copied, setCopied] = React.useState(false);

  /** Copies the message text to the clipboard and shows a brief confirmation. */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — try selecting the text manually");
    }
  }

  function handleBranchClick() {
    openBranchNameToast(messageId, onBranch);
  }

  return (
    <div className={cn("mt-1.5 flex items-center gap-0.5", !isAssistant && "flex-row-reverse")}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Copy"
        onClick={handleCopy}
        className="size-7 text-muted-foreground/60 hover:text-foreground"
      >
        {copied ? <CheckIcon className="size-3.5 text-primary" /> : <CopyIcon className="size-3.5" />}
      </Button>

      {showRegenerate ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Regenerate response"
          onClick={() => onRegenerate?.(messageId)}
          className="size-7 text-muted-foreground/60 hover:text-foreground"
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Branch from here"
        onClick={handleBranchClick}
        className="size-7 text-muted-foreground/60 hover:text-primary"
      >
        <GitBranchIcon className="size-3.5" />
      </Button>
    </div>
  );
}

/**
 * Opens a sonner toast with an inline name field instead of `window.prompt`
 * — lets the user name the branch (or skip) without a blocking native dialog.
 */
function openBranchNameToast(
  messageId: string,
  onBranch: (messageId: string, name?: string) => void
) {
  toast.custom(
    (t) => <BranchNameToast messageId={messageId} toastId={t} onBranch={onBranch} />,
    { duration: 15000 }
  );
}

function BranchNameToast({
  messageId,
  toastId,
  onBranch,
}: {
  messageId: string;
  toastId: string | number;
  onBranch: (messageId: string, name?: string) => void;
}) {
  const [name, setName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function confirm() {
    onBranch(messageId, name.trim() || undefined);
    toast.dismiss(toastId);
    toast.success(name.trim() ? `Branch "${name.trim()}" created` : "Branch created");
  }

  return (
    <div className="flex w-80 items-center gap-2 rounded-xl border border-border bg-popover p-3 shadow-lg">
      <GitBranchIcon className="size-4 shrink-0 text-primary" />
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") toast.dismiss(toastId);
        }}
        placeholder="Name this branch (optional)"
        className="h-8 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
      />
      <Button type="button" size="sm" className="h-7 px-2.5 text-xs" onClick={confirm}>
        Create
      </Button>
    </div>
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