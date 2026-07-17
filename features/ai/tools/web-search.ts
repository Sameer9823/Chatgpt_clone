import { openai } from "@ai-sdk/openai";

/**
 * OpenAI's hosted web search tool (Responses API). Unlike a custom tool,
 * this runs entirely on OpenAI's side — no execute function, no external
 * API key needed. The model decides on its own when to call it.
 */
export const webSearch = openai.tools.webSearch({
  // 'low' | 'medium' | 'high' — more context = better answers, higher latency/cost.
  searchContextSize: "high",
});