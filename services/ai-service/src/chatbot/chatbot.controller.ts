import type { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@repo/database";
import type { ChatTurn } from "@repo/types";
import { CHATBOT_SYSTEM_PROMPT } from "./chatbot.prompt";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
let client: Anthropic | null = null;
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export async function handleChat(req: Request, res: Response) {
  const { messages } = req.body as { messages: ChatTurn[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages required" });
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { name: true, brand: true, basePrice: true, category: { select: { name: true } } },
    take: 20,
  });
  const catalog = products
    .map((p) => `- ${p.name}${p.brand ? ` by ${p.brand}` : ""} (${p.category.name}) $${p.basePrice}`)
    .join("\n");

  const ai = anthropic();
  if (!ai) {
    return res.json({
      reply:
        "AURA assistant (demo mode — set ANTHROPIC_API_KEY to enable live replies). Try browsing New Arrivals or use Visual Search.",
    });
  }

  const response = await ai.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: `${CHATBOT_SYSTEM_PROMPT}\n\nCurrent catalog (sample):\n${catalog}`,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const reply = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  res.json({ reply: reply || "Sorry, I didn't catch that." });
}
