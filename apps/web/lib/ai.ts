import Anthropic from "@anthropic-ai/sdk";

// Shared Anthropic client. The chatbot / styling advice features use Claude.
// If ANTHROPIC_API_KEY is unset, callers should fall back to a canned response
// so the storefront still runs in a fresh clone.

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}
