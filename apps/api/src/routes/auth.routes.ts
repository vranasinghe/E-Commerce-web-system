import { Router } from "express";
import { prisma } from "@repo/database";

export const authRoutes = Router();

// Placeholder auth. Production uses NextAuth.js (Credentials + Google OAuth)
// with JWT sessions; this endpoint just checks a user exists for demo purposes.
authRoutes.post("/login", async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // A real implementation would verify the password and issue a JWT here.
    res.json({ user, token: "demo-token" });
  } catch (err) {
    next(err);
  }
});
