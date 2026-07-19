// app/page.tsx
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  GitBranchIcon,
  GlobeIcon,
  MessageCircleIcon,
  SearchIcon,
  SparklesIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Answers with the page open",
    body: "It reaches for the live web mid-reply when a question needs today's answer, not last year's — then cites what it found.",
  },
  {
    icon: SparklesIcon,
    title: "Watches itself think",
    body: "Every tool call streams in as it happens: the search, the result, the sentence it's writing because of that result.",
  },
  {
    icon: GitBranchIcon,
    title: "Every reply can fork",
    body: "Don't like where a reply went? Branch from that exact message and try another direction — the original thread stays put.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Ask anything",
    body: "Start a thread the way you'd start any chat — no setup, no config screen first.",
  },
  {
    n: "02",
    title: "Watch it search and write",
    body: "See the tool call, the sources, and the answer stream in together — never a silent wait.",
  },
  {
    n: "03",
    title: "Branch when you need to",
    body: "Hover any message, fork it, and explore a different angle without disturbing the original thread.",
  },
] as const;

const FAQS = [
  {
    q: "How is branching different from just editing a message?",
    a: "Editing overwrites history — the earlier version is gone. Branching keeps the original thread exactly as it was and opens a fresh path alongside it, so you can compare both later.",
  },
  {
    q: "Does it always search the web?",
    a: "No — it decides mid-reply, the same way you would. If a question needs current information, it reaches for a search; if it doesn't, it just answers.",
  },
  {
    q: "Can I go back to an earlier branch anytime?",
    a: "Yes. Every branch stays in your sidebar as its own thread — nothing is deleted or archived just because you started exploring a different direction.",
  },
  {
    q: "Is there a limit to how many times I can branch?",
    a: "No hard limit. Some conversations end up with a handful of branches off a single tricky question — that's the whole point.",
  },
] as const;

/**
 * Public marketing landing page at `/`. Shown to everyone, signed in or
 * not — signed-in visitors get an "Open chat" shortcut instead of "Log in".
 * Navigation is intentionally minimal (logo + one CTA only) so discovery
 * happens by scrolling the story top to bottom, not by jumping via nav links.
 */
export default async function LandingPage() {
  const { userId } = await auth();
  const primaryHref = userId ? "/chat" : "/sign-in";
  const primaryLabel = userId ? "Open chat" : "Log in";

  return (
    <div
      className={`${fraunces.variable} min-h-screen overflow-x-clip bg-[#15110D] text-[#F4EEE3]`}
    >
      {/* Scoped keyframes for this page only — no globals.css edits needed */}
      <style>{`
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -4%) scale(1.06); }
        }
        .animate-blob-drift { animation: blob-drift 14s ease-in-out infinite; }

        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
        .animate-typing-dot { animation: typing-dot 1.1s ease-in-out infinite; }

        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .animate-bob { animation: bob 2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .animate-blob-drift, .animate-typing-dot, .animate-bob { animation: none; }
        }
      `}</style>

      {/* ---------- Nav: logo + single CTA only, no section jump-links ---------- */}
      <header className="sticky top-0 z-50 border-b border-[#241D14] bg-[#15110D]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <span className="text-lg font-semibold tracking-tight">
            chai<span className="text-[#E7A93D]">gpt</span>
          </span>

          <Button
            render={<Link href={primaryHref} />}
            size="sm"
            className="bg-[#E7A93D] text-[#15110D] hover:bg-[#f0b654]"
          >
            {primaryLabel}
          </Button>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="animate-blob-drift pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-[#E7A93D] opacity-[0.10] blur-[140px]"
        />
        <div
          aria-hidden
          className="animate-blob-drift pointer-events-none absolute top-40 left-[-15%] h-[420px] w-[420px] rounded-full bg-[#7E9473] opacity-[0.08] blur-[130px]"
          style={{ animationDelay: "-7s" }}
        />

        <main className="relative mx-auto grid max-w-6xl gap-16 px-6 pt-16 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-[#3A3022] bg-[#1A1510] px-3 py-1 text-xs font-medium tracking-wide text-[#B4A48D] uppercase">
              A chat assistant that stays out of your way
            </p>

            <h1
              className={`${fraunces.className} mt-6 text-5xl leading-[1.05] font-medium text-balance sm:text-6xl`}
            >
              One thread rarely fits
              <br />
              <span className="italic text-[#E7A93D]">the whole conversation.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#CBBEA8]">
              ChaiGpt streams answers as it searches, reasons, and writes — and
              lets you branch off from any message to explore a different
              direction without losing the original thread.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                render={<Link href={primaryHref} />}
                className="bg-[#E7A93D] text-[#15110D] hover:bg-[#f0b654]"
              >
                {primaryHref === "/chat" ? primaryLabel : "Log in to start chatting"}
                <ArrowRightIcon />
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8A7C66]">
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="size-3.5" />
                Streams as it thinks
              </span>
              <span className="flex items-center gap-1.5">
                <SearchIcon className="size-3.5" />
                Live web search
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranchIcon className="size-3.5" />
                Branchable threads
              </span>
            </div>
          </div>

          {/* Signature visual: mock chat window forking into two branches */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="animate-in fade-in slide-in-from-bottom-4 rounded-3xl border border-[#3A3022]/70 bg-[#1A1510]/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm duration-700"
              style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
            >
              <div className="flex items-center gap-2 border-b border-[#3A3022]/70 px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#E7A93D]/40" />
                <span className="size-2.5 rounded-full bg-[#7E9473]/40" />
                <span className="size-2.5 rounded-full bg-[#F4EEE3]/20" />
                <span className="ml-2 text-xs text-[#9A8B73]">chaigpt · new chat</span>
              </div>

              <div className="space-y-3 px-4 py-5">
                <div
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: "350ms", animationFillMode: "backwards" }}
                >
                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-[#E7A93D] px-3.5 py-2 text-sm text-[#15110D]">
                    What are today's mortgage rates, and how do they compare to
                    last year?
                  </div>
                </div>

                <div
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: "650ms", animationFillMode: "backwards" }}
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E7A93D]/30 bg-[#E7A93D]/10 px-2.5 py-1 text-[11px] text-[#E7A93D]">
                    <GlobeIcon className="size-3" />
                    Searched the web
                    <span className="ml-0.5 inline-flex items-center gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="animate-typing-dot size-1 rounded-full bg-[#E7A93D] motion-reduce:animate-none"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>

                <div
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: "950ms", animationFillMode: "backwards" }}
                >
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#241D14] px-3.5 py-2 text-sm text-[#E4DCCB]">
                    Today's average 30-year fixed is 6.1% — about half a point
                    below this time last year
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-[#E7A93D] motion-reduce:hidden" />
                  </div>
                </div>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-2 px-4 pb-2 duration-500"
                style={{ animationDelay: "1250ms", animationFillMode: "backwards" }}
              >
                <div className="flex items-center gap-2 border-t border-dashed border-[#3A3022] pt-3 text-[11px] text-[#9A8B73]">
                  <GitBranchIcon className="size-3 text-[#7E9473]" />
                  Branched into 2 threads from here
                </div>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-2.5 border-t border-[#3A3022]/70 px-4 py-4 duration-500 sm:grid-cols-2"
                style={{ animationDelay: "1450ms", animationFillMode: "backwards" }}
              >
                <div className="rounded-xl border border-[#E7A93D]/25 bg-[#15110D]/60 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#E7A93D]">
                    <GitBranchIcon className="size-3" />
                    15-year comparison
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#B4A48D]">
                    A 15-year fixed is running 5.4% right now — lower rate,
                    higher payment.
                  </p>
                </div>
                <div className="rounded-xl border border-[#7E9473]/25 bg-[#15110D]/60 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7E9473]">
                    <GitBranchIcon className="size-3" />
                    Refinance timing
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#B4A48D]">
                    Worth watching: most forecasts have rates easing further
                    into next quarter.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="animate-in fade-in absolute -right-4 -bottom-5 hidden items-center gap-1.5 rounded-full border border-[#3A3022] bg-[#211A12] px-3 py-1.5 text-xs text-[#CBBEA8] shadow-lg duration-500 sm:flex"
              style={{ animationDelay: "1700ms", animationFillMode: "backwards" }}
            >
              <GitBranchIcon className="size-3.5 text-[#E7A93D]" />
              Fork any reply, anytime
            </div>
          </div>
        </main>

        {/* Scroll cue — replaces the old "See how it works" jump-link button */}
        <div className="relative flex justify-center pb-10">
          <span className="flex flex-col items-center gap-1.5 text-[11px] tracking-wide text-[#7A6C56] uppercase">
            Keep scrolling
            <ChevronDownIcon className="animate-bob size-4" />
          </span>
        </div>

        {/* ---------- Features ---------- */}
        <section className="border-t border-[#241D14] bg-[#1A1510]">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
            <div className="max-w-xl">
              <p className="text-xs font-medium tracking-[0.2em] text-[#8A7C66] uppercase">
                Why it feels different
              </p>
              <h2 className={`${fraunces.className} mt-3 text-3xl font-medium sm:text-4xl`}>
                Built around how conversations actually go
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="group h-full rounded-2xl border border-[#3A3022] bg-[#211A12] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#E7A93D]/50 hover:shadow-[0_20px_50px_-25px_rgba(231,169,61,0.35)]"
                >
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-[#E7A93D]/10 text-[#E7A93D] transition-colors group-hover:bg-[#E7A93D]/20">
                    <Icon className="size-5" />
                  </div>
                  <h3 className={`${fraunces.className} mt-5 text-xl font-medium`}>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#B4A48D]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ---------- How it works ---------- */}
      <section className="border-t border-[#241D14]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.2em] text-[#8A7C66] uppercase">
              How it works
            </p>
            <h2 className={`${fraunces.className} mt-3 text-3xl font-medium sm:text-4xl`}>
              Three steps, no ceremony
            </h2>
          </div>

          <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute top-5 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-[#3A3022] to-transparent sm:block"
            />
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <span
                  className={`${fraunces.className} relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-[#3A3022] bg-[#15110D] text-sm text-[#E7A93D]`}
                >
                  {step.n}
                </span>
                <h3 className={`${fraunces.className} mt-5 text-xl font-medium`}>
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#B4A48D]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Quote / proof section ---------- */}
      <section className="border-t border-[#241D14] bg-[#1A1510]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-8 sm:py-24">
          <p className="text-xs font-medium tracking-[0.2em] text-[#8A7C66] uppercase">
            Built for the messy part of thinking
          </p>
          <blockquote
            className={`${fraunces.className} mt-6 text-2xl leading-snug font-medium text-balance italic sm:text-3xl`}
          >
            &ldquo;The best answer to a hard question is rarely the first one —
            it&rsquo;s the third one, after two branches you didn&rsquo;t
            expect to need.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-[#8A7C66]">
            The idea behind every fork in ChaiGpt
          </p>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-[#241D14]">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.2em] text-[#8A7C66] uppercase">
              Questions
            </p>
            <h2 className={`${fraunces.className} mt-3 text-3xl font-medium sm:text-4xl`}>
              Good to know
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#241D14] border-t border-b border-[#241D14]">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="py-6">
                <h3 className="text-base font-medium text-[#F4EEE3]">{q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B4A48D]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="relative overflow-hidden border-t border-[#241D14] bg-[#1A1510]">
        <div
          aria-hidden
          className="animate-blob-drift pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E7A93D] opacity-[0.08] blur-[130px]"
        />
        <div className="relative mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <MessageCircleIcon className="mx-auto size-8 text-[#E7A93D]" />
          <h2 className={`${fraunces.className} mt-6 text-3xl font-medium text-balance sm:text-4xl`}>
            Start a thread. <span className="italic text-[#E7A93D]">Branch it later.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#CBBEA8]">
            No setup screens between you and the first message.
          </p>
          <Button
            size="lg"
            render={<Link href={primaryHref} />}
            className="mt-8 bg-[#E7A93D] text-[#15110D] hover:bg-[#f0b654]"
          >
            {primaryLabel}
            <ArrowRightIcon />
          </Button>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-[#241D14]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center sm:px-8">
          <div>
            <span className="text-sm font-semibold tracking-tight">
              chai<span className="text-[#E7A93D]">gpt</span>
            </span>
            <p className={`${fraunces.className} mt-2 text-lg italic text-[#CBBEA8]`}>
              Pick up any thread, anytime.
            </p>
          </div>
          <Button
            render={<Link href={primaryHref} />}
            variant="outline"
            className="border-[#3A3022] bg-transparent text-[#F4EEE3] hover:bg-[#211A12] hover:text-[#F4EEE3]"
          >
            {primaryLabel}
            <SquareArrowOutUpRightIcon />
          </Button>
        </div>
      </footer>
    </div>
  );
}