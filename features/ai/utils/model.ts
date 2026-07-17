import { openai } from "@ai-sdk/openai";

/** Default OpenAI model used when a conversation has no model override. */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

/**
 * Returns an OpenAI language model instance for chat completions.
 *
 * @param modelId - Optional model identifier; falls back to {@link DEFAULT_CHAT_MODEL}.
 */
export function getChatModel(modelId?: string | null) {
    return openai(modelId || DEFAULT_CHAT_MODEL)
}

/**
 * Model id substrings that can't use hosted Responses-API tools like
 * `web_search` — non-chat model families (embeddings, audio, image, legacy
 * completion-only snapshots) rather than exact model versions, since exact
 * support changes over time and this list would go stale fast.
 */
const WEB_SEARCH_UNSUPPORTED_PATTERNS = [
    "embedding",
    "whisper",
    "tts",
    "dall-e",
    "moderation",
    "gpt-3.5",     // legacy chat-completions-only family
    "gpt-4-turbo", // legacy chat-completions-only family
    "gpt-4-0",     // legacy dated gpt-4 chat-completions snapshots
    "davinci",
    "babbage",
];

/**
 * Best-effort check for whether a model can use hosted Responses-API tools
 * such as `web_search`. Optimistic by default (returns true) for anything
 * not explicitly matched, since most current chat models support it and a
 * denylist ages better than an allowlist here.
 *
 * This is a heuristic, not a live capability check — if a model rejects the
 * tool for a reason we didn't anticipate, the chat route's `onError` handler
 * still degrades gracefully instead of crashing the stream.
 */
export function supportsWebSearch(modelId?: string | null) {
    const id = (modelId || DEFAULT_CHAT_MODEL).toLowerCase();
    return !WEB_SEARCH_UNSUPPORTED_PATTERNS.some((pattern) => id.includes(pattern));
}