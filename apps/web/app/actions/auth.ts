"use server";

import { cookies } from "next/headers";
import { prisma } from "@repo/database";
import { hashPassword, verifyPassword, signJWT } from "../../lib/auth";

// ─── Unified Login (role-aware) ────────────────────────────────────────────
// Used by the single /login portal. Returns { success, role } so the
// client can redirect: ADMIN/STAFF → /admin, CUSTOMER → /
export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return { error: "Invalid email or password" };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { error: "Invalid email or password" };
    }

    const token = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Return role so client can redirect to the correct portal
    return { success: true, role: user.role };
  } catch (err: unknown) {
    console.error("Login action error:", err);
    return { error: "An unexpected error occurred during login" };
  }
}

// ─── Signup ────────────────────────────────────────────────────────────────
export async function signupAction(_prevState: unknown, formData: FormData) {
  const firstName = (formData.get("firstName") as string | null)?.trim();
  const lastName = (formData.get("lastName") as string | null)?.trim();
  const nameField = (formData.get("name") as string | null)?.trim();
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const role = (formData.get("role") as string | null) || "CUSTOMER";
  const inviteCode = (formData.get("inviteCode") as string | null)?.trim();

  const fullName = firstName && lastName
    ? `${firstName} ${lastName}`
    : firstName || lastName || nameField || "";

  if (!fullName || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  if (role === "STAFF") {
    const STAFF_INVITE_CODE = process.env.STAFF_INVITE_CODE || "STAFF-INVITE-2024";
    if (inviteCode !== STAFF_INVITE_CODE) {
      return { error: "Invalid staff invite code. Please contact your administrator." };
    }
  }

  const allowedRoles = ["CUSTOMER", "STAFF"];
  const sanitizedRole = allowedRoles.includes(role.toUpperCase())
    ? (role.toUpperCase() as "CUSTOMER" | "STAFF")
    : "CUSTOMER";

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { error: "A user with this email already exists" };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: sanitizedRole,
      },
    });

    const token = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return { success: true, role: user.role };
  } catch (err: unknown) {
    console.error("Signup action error:", err);
    return { error: "An unexpected error occurred during signup" };
  }
}

// ─── Logout ────────────────────────────────────────────────────────────────
export async function logoutAction() {
  cookies().delete("auth_token");
  return { success: true };
}

// ─── Admin Login (kept for backward compat, but now delegates to loginAction)
export async function adminLoginAction(_prevState: unknown, formData: FormData) {
  const result = await loginAction(undefined, formData);
  if (result.success && result.role !== "ADMIN" && result.role !== "STAFF") {
    // Customer tried to log in via admin — sign them out and deny
    cookies().delete("auth_token");
    return { error: "Access denied. Admin or Staff privileges required." };
  }
  return result;
}
