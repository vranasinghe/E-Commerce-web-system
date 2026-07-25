import { Router } from "express";
import { productService } from "../services/product.service";

export const productRoutes = Router();

productRoutes.get("/", async (req, res, next) => {
  try {
    const products = await productService.list({
      category: req.query.category as string | undefined,
      q: req.query.q as string | undefined,
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

productRoutes.get("/:slug", async (req, res, next) => {
  try {
    const product = await productService.getBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

productRoutes.post("/embeddings", async (req, res, next) => {
  try {
    const { productId, textEmbedding, imageEmbedding } = req.body;
    if (!productId || !textEmbedding || !imageEmbedding) {
      return res.status(400).json({ error: "productId, textEmbedding, and imageEmbedding required" });
    }
    const result = await productService.upsertEmbedding(productId, textEmbedding, imageEmbedding);
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});
