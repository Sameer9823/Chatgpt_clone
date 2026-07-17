"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

/** Lifecycle state of a tool call part, as reported by the AI SDK. */
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

/** Output shape of OpenAI's hosted web_search tool. */
export type WebSearchToolOutput = {
  action?: { type?: string; query?: string };
  sources?: Array<{ type: "url"; url: string; title?: string }>;
};

const STATE_LABEL: Record<ToolState, string> = {
  "input-streaming": "Preparing search…",
  "input-available": "Searching the web…",
  "output-available": "Searched the web",
  "output-error": "Search failed",
};

/** Root collapsible container for a single tool invocation. */
export const Tool = ({ className, ...props }: ComponentProps<typeof Collapsible>) => (
  <Collapsible
    className={cn(
      "not-prose mb-2 w-full max-w-full rounded-lg border bg-card/50 text-sm",
      className
    )}
    {...props}
  />
);

type ToolHeaderProps = {
  state: ToolState;
  label?: string;
};

/** Clickable header row: icon, status label, and status badge. */
export const ToolHeader = ({ state, label }: ToolHeaderProps) => (
  <CollapsibleTrigger className="group/tool-trigger flex w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground hover:text-foreground">
    <GlobeIcon className="size-3.5 shrink-0" />
    <span className="flex-1 truncate text-xs">
      {label ?? STATE_LABEL[state]}
    </span>
    <StatusBadge state={state} />
    <ChevronDownIcon className="size-3.5 shrink-0 transition-transform group-aria-expanded/tool-trigger:rotate-180" />
  </CollapsibleTrigger>
);

const StatusBadge = ({ state }: { state: ToolState }) => {
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Loader2Icon className="size-3 animate-spin" />
        Running
      </Badge>
    );
  }

  if (state === "output-error") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XIcon className="size-3" />
        Error
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <CheckIcon className="size-3" />
      Done
    </Badge>
  );
};

/** Collapsible body containing the input/output sections. */
export const ToolContent = ({ className, ...props }: ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent
    className={cn(
      "space-y-2 border-t px-3 py-2 text-xs text-muted-foreground",
      className
    )}
    {...props}
  />
);

/** Renders the search query the tool was called with. */
export const ToolInput = ({ input }: { input: unknown }) => (
  <div>
    <p className="mb-1 font-medium text-foreground/70">Query</p>
    <p className="rounded-md bg-muted px-2 py-1.5 text-[11px]">
      {typeof input === "string" ? input : JSON.stringify(input)}
    </p>
  </div>
);

/** Renders the tool's output — a list of URL sources, or an error message. */
export const ToolOutput = ({
  output,
  errorText,
}: {
  output?: WebSearchToolOutput;
  errorText?: string;
}) => {
  if (errorText) {
    return (
      <div>
        <p className="mb-1 font-medium text-destructive">Error</p>
        <p className="text-destructive/90">{errorText}</p>
      </div>
    );
  }

  const sources = output?.sources ?? [];

  if (sources.length === 0) {
    return <p>No sources returned.</p>;
  }

  return (
    <div>
      <p className="mb-1 font-medium text-foreground/70">Sources</p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {source.title || source.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};