# chaigpt

A ChatGPT-style AI chat app built with Next.js 16, the Vercel AI SDK, and Clerk auth — with one feature most clones skip: **every message can be branched into an independent thread**, so exploring a different direction never overwrites the conversation you already had.

**Live demo:** [chatgpt-clone-silk-mu.vercel.app](https://chatgpt-clone-silk-mu.vercel.app/)
**Source:** [github.com/Sameer9823/Chatgpt_clone](https://github.com/Sameer9823/Chatgpt_clone)

---

## Features

### Streaming chat
Replies stream token-by-token via the Vercel AI SDK's `streamText` + `useChat`, so the UI updates as the model generates rather than waiting for a full response.

### Live web search
The model has a hosted OpenAI web search tool (`openai.tools.webSearch`) available on every turn. It decides on its own — no user toggle — whether a question needs current information, calls the tool mid-reply, and continues generating the final answer using what it found. The tool call and its result render inline as a collapsible card in the message stream, so the search is visible, not hidden.


### Conversation branching
The core differentiator. From any message, a user can fork the conversation:
- Every message up to and including the branch point is copied into a brand-new conversation row.
- The original thread is left completely untouched — nothing is moved or deleted.
- Branches can be made from a branch, producing a multi-level tree, not just a flat A/B split.
- All conversations that share a tree (root + every branch, however deep) are queryable together via a denormalized `rootConversationId`, so listing "every branch of this chat" is a single indexed query instead of a recursive walk.
- Branches can be renamed independently of the thread they forked from.
- Deleting a branch never touches its parent or siblings; deleting the root is blocked from the branch-delete path entirely (call the regular conversation delete instead).

### Message actions
Every message — user or assistant — has a persistent action row (not hidden behind hover-only discovery):
- **Copy** — copies the message's plain text to the clipboard.
- **Regenerate** — re-runs the model for the most recent assistant reply.
- **Branch** — opens an inline toast with a name field, so forking a thread never requires a blocking native `window.prompt()`.

### Conversation management
- Rename, pin, archive, and delete conversations from the sidebar.
- Pinned conversations sort to the top; everything else sorts by most recent activity.
- Reopening the app or reloading `/chat` reuses an existing untitled, message-free "New Chat" instead of spawning a fresh empty conversation every time — the sidebar doesn't accumulate junk from accidental reloads.

### Auth
Clerk handles sign-in/sign-up. Every protected route (`/chat`, `/c/[id]`, `/api/chat`) is guarded by resource-level `auth.protect()` checks inside the page/route itself, rather than relying solely on middleware path-matching — the safer of the two patterns, since it can't drift out of sync with how Next.js actually resolves routes. `middleware.ts` still runs as a first-pass gate for everything except the public landing page and sign-in.

### UI
- Dark, warm-toned design system (deep charcoal-brown background, turmeric-gold accent, muted sage-green secondary accent) — not a stock shadcn theme.
- Collapsible sidebar with skeleton loading states, an animated active-chat indicator, and light/dark theme toggle (`next-themes`).
- Public marketing landing page (`/`) is a single-file server component: hero, feature grid, "how it works" steps, a pull-quote section, and an FAQ — built for top-to-bottom scroll discovery rather than a nav with jump-links.
- Toast notifications (`sonner`) for copy confirmations, branch creation, and error states.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Auth | Clerk |
| Database | PostgreSQL via Prisma ORM (`@prisma/adapter-pg`, custom generated client output) |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`) |
| State/data fetching | TanStack Query |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn/ui (Base UI–based components) |
| Icons | lucide-react, react-icons |
| Animation | Framer Motion + Tailwind `animate-in` utilities |
| Markdown rendering | streamdown (with code, math, mermaid, and CJK plugins) |
| Deployment | Vercel |

---

## Data model

```
User
 └─ Conversation (1 : many)
     ├─ parentConversationId → self-relation (branch tree)
     ├─ rootConversationId    → denormalized top-of-tree id
     ├─ branchPointMessageId  → which message this branch forked from
     └─ Message (1 : many)
         ├─ role: USER | ASSISTANT | SYSTEM | TOOL
         ├─ status: PENDING | COMPLETE | ERROR
         ├─ content (text)
         └─ parts (JSON — tool calls, tool results, etc.)
```

Full schema: [`prisma/schema.prisma`](./prisma/schema.prisma)

---

## Project structure

```
app/
├─ page.tsx                  # Public landing page ("/")
├─ (auth)/sign-in/           # Clerk sign-in
├─ (root)/                   # Auth-gated layout (auth.protect() + user sync)
│  ├─ chat/                  # Redirects into an existing/new conversation
│  └─ c/[id]/                # Conversation view
└─ api/chat/route.ts         # Streaming chat endpoint

features/
├─ ai/
│  ├─ actions/chat-store.ts  # Load/persist chat messages
│  ├─ tools/web-search.ts    # Hosted OpenAI web search tool
│  └─ utils/model.ts         # Model selection + capability detection
├─ auth/                     # requireUser(), onboarding/user sync
├─ conversation/
│  ├─ actions/                # Conversation CRUD + branching
│  ├─ components/             # Sidebar, composer, messages, branch nav
│  └─ hooks/                  # React Query hooks
├─ home/                      # "Start new chat" entry action
└─ messages/

lib/db.ts                    # Prisma client singleton (custom output path)
middleware.ts                # Clerk route protection (first-pass gate)
```

---

## Running locally

**1. Install dependencies**
```bash
npm install
```
(`postinstall` runs `prisma generate` automatically — required since this project uses a custom Prisma client output path rather than the default `node_modules/@prisma/client`.)

**2. Environment variables** — create `.env.local`:
```dotenv
DATABASE_URL="postgresql://..."

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/chat"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/chat"

OPENAI_API_KEY="sk-..."
```

**3. Run migrations**
```bash
npx prisma migrate deploy
```

**4. Start the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment notes (Vercel)

- The `postinstall: "prisma generate"` script is required — without it, a fresh Vercel build fails with `Module not found` on the generated Prisma client path, since that folder is a build artifact and isn't committed to git.
- Set all environment variables above in the Vercel project settings, not just `.env.local`.
- `DATABASE_URL` needs a Postgres instance reachable from Vercel's build/runtime environment (e.g. Neon, Supabase, or Vercel Postgres).

---

## License

Personal/portfolio project — no license file present; treat as all-rights-reserved unless you add one.

---

## Author

**Sameer**
GitHub: [@Sameer9823](https://github.com/Sameer9823)