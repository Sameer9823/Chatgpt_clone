"use client";

import { Fraunces } from "next/font/google";
import { SearchIcon, LightbulbIcon, CodeIcon, PenLineIcon } from "lucide-react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-display-empty",
});

const PROMPTS = [
  { icon: SearchIcon, label: "What's the latest on...", prompt: "What's the latest news on " },
  { icon: LightbulbIcon, label: "Explain a concept", prompt: "Explain how " },
  { icon: CodeIcon, label: "Help me debug", prompt: "Help me debug this error: " },
  { icon: PenLineIcon, label: "Draft something", prompt: "Draft a message about " },
] as const;

type ChatEmptyProps = {
  onPick?: (prompt: string) => void;
};

/** Empty-state placeholder shown before the first message is sent. */
export function ChatEmpty({ onPick }: ChatEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
            <span className="relative text-lg font-semibold text-primary">C</span>
          </div>
          <h1
            className={`${fraunces.variable} text-2xl text-foreground`}
            style={{ fontFamily: "var(--font-display-empty)" }}
          >
            How can I help you today?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask anything — replies stream in real time.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROMPTS.map(({ icon: Icon, label, prompt }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onPick?.(prompt)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}