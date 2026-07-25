import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/products.routes";
import { orderRoutes } from "./routes/orders.routes";
import { userRoutes } from "./routes/users.routes";
import { authRoutes } from "./routes/auth.routes";
import { aiRoutes } from "./routes/ai.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();
const PORT = Number(process.env.API_PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "core-api" }));

import { authLimiter, aiLimiter } from "./middleware/rate-limit.middleware";

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🛍️  Core API listening on http://localhost:${PORT}`);
});
