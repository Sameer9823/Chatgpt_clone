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
  SearchIcon,
  SquareArrowOutUpRightIcon,
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

/** Per-state accent colors, shared by the icon badge and status badge. */
const STATE_ACCENT: Record<ToolState, string> = {
  "input-streaming": "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  "input-available": "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  "output-available": "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  "output-error": "text-destructive bg-destructive/10",
};

/** Root collapsible container for a single tool invocation. */
export const Tool = ({ className, ...props }: ComponentProps<typeof Collapsible>) => (
  <Collapsible
    className={cn(
      "not-prose mb-2 w-full max-w-full overflow-hidden rounded-xl border bg-card/50 text-sm shadow-sm transition-shadow hover:shadow-md",
      className
    )}
    {...props}
  />
);

type ToolHeaderProps = {
  state: ToolState;
  label?: string;
};

/** Clickable header row: state icon, status label, and status badge. */
export const ToolHeader = ({ state, label }: ToolHeaderProps) => {
  const running = state === "input-streaming" || state === "input-available";

  return (
    <CollapsibleTrigger className="group/tool-trigger flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50">
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
          STATE_ACCENT[state]
        )}
      >
        <GlobeIcon className={cn("size-3.5", running && "animate-pulse")} />
      </span>

      <span className="flex-1 truncate text-xs font-medium text-foreground/80">
        {label ?? STATE_LABEL[state]}
      </span>

      <StatusBadge state={state} />

      <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded/tool-trigger:rotate-180" />
    </CollapsibleTrigger>
  );
};

const StatusBadge = ({ state }: { state: ToolState }) => {
  if (state === "input-streaming" || state === "input-available") {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
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
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
    >
      <CheckIcon className="size-3" />
      Done
    </Badge>
  );
};

/** Collapsible body containing the input/output sections, animated open/closed. */
export const ToolContent = ({ className, ...props }: ComponentProps<typeof CollapsibleContent>) => (
  <CollapsibleContent
    className={cn(
      "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
      className
    )}
    {...props}
  >
    <div className="space-y-3 border-t px-3 py-3 text-xs text-muted-foreground">
      {props.children}
    </div>
  </CollapsibleContent>
);

/** Renders the search query the tool was called with, as a small pill. */
export const ToolInput = ({ input }: { input: unknown }) => {
  const text = typeof input === "string" ? input : JSON.stringify(input);

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium tracking-wide text-foreground/60 uppercase">
        Query
      </p>
      <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border bg-muted/60 px-2.5 py-1.5">
        <SearchIcon className="size-3 shrink-0 text-muted-foreground" />
        <span className="truncate text-[11px] text-foreground/80">{text}</span>
      </div>
    </div>
  );
};

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
      <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-2">
        <XIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
        <p className="text-destructive/90">{errorText}</p>
      </div>
    );
  }

  const sources = output?.sources ?? [];

  if (sources.length === 0) {
    return <p className="text-muted-foreground/70 italic">No sources returned.</p>;
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium tracking-wide text-foreground/60 uppercase">
        Sources · {sources.length}
      </p>
      <ul className="space-y-1">
        {sources.map((source, i) => (
          <SourceRow key={source.url} index={i + 1} source={source} />
        ))}
      </ul>
    </div>
  );
};

function SourceRow({
  index,
  source,
}: {
  index: number;
  source: { url: string; title?: string };
}) {
  const hostname = safeHostname(source.url);

  return (
    <li>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="group/source flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/60"
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-[10px] font-medium text-muted-foreground/70">
          {index}
        </span>

        {hostname ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://www.google.com/s2/favicons?sz=32&domain=${hostname}`}
            alt=""
            className="size-3.5 shrink-0 rounded-sm"
          />
        ) : (
          <GlobeIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}

        <span className="min-w-0 flex-1 truncate font-medium text-foreground/80">
          {source.title || hostname || source.url}
        </span>

        {hostname ? (
          <span className="hidden shrink-0 truncate text-[10px] text-muted-foreground/60 sm:inline">
            {hostname}
          </span>
        ) : null}

        <SquareArrowOutUpRightIcon className="size-3 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover/source:opacity-100" />
      </a>
    </li>
  );
}

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}