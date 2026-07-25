import { Router } from "express";
import { prisma } from "@repo/database";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const userRoutes = Router();

userRoutes.get("/", requireAuth, requireRole(["ADMIN", "STAFF"]), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});
