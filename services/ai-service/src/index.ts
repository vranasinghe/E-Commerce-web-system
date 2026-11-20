import express from "express";
import cors from "cors";
import { handleChat } from "./chatbot/chatbot.controller";
import { recommendForProduct } from "./recommendations/recommendation.engine";
import { predictFit } from "./fit-predictor/fit-model";
import type { FitInput } from "@repo/types";

const app = express();
const PORT = Number(process.env.AI_SERVICE_PORT ?? 4100);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "ai-service" }));

// 1. AI Shopping Assistant (chatbot)
app.post("/chatbot", handleChat);

// 2. AI Recommendation Engine
app.get("/recommendations", async (req, res, next) => {
  try {
    const productId = req.query.productId as string | undefined;
    if (!productId) return res.json({ items: [] });
    res.json({ items: await recommendForProduct(productId) });
  } catch (err) {
    next(err);
  }
});

// This legacy TypeScript server does not power the storefront's image search.
app.post("/visual-search", (_req, res) => {
  res.status(410).json({ error: "Image search is served by the Python AI service." });
});

// 4. AI Size & Fit Predictor
app.post("/fit-predictor", (req, res) => {
  res.json(predictFit(req.body as FitInput));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : "error" });
});

app.listen(PORT, () => {
  console.log(`🤖  AI service listening on http://localhost:${PORT}`);
});
