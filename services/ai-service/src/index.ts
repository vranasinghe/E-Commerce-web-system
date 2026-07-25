import express from "express";
import cors from "cors";
import { handleChat } from "./chatbot/chatbot.controller";
import { recommendForProduct } from "./recommendations/recommendation.engine";
import { embedImage } from "./visual-search/image-embedding";
import { searchByImageEmbedding } from "./visual-search/similarity-search";
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

// 3. AI Visual Search — accepts { imageBase64 } and returns ranked products
app.post("/visual-search", async (req, res, next) => {
  try {
    const { imageBase64 } = req.body as { imageBase64?: string };
    const bytes = imageBase64
      ? Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64")
      : Buffer.alloc(0);
    const embedding = await embedImage(bytes);
    res.json({ results: await searchByImageEmbedding(embedding) });
  } catch (err) {
    next(err);
  }
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
