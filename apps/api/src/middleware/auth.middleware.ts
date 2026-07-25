import type { NextFunction, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-aura-key-value-123456789";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
}

// HMAC-SHA256 JWT verification using Web Crypto API
async function verifyJWT(token: string, secret = JWT_SECRET): Promise<AuthenticatedUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerBase64, payloadBase64, signatureBase64] = parts as [string, string, string];
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerBase64}.${payloadBase64}`);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const sigBuf = base64urlToBuffer(signatureBase64);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBuf, data);
    if (!isValid) return null;
    
    const payload = JSON.parse(base64urlDecode(payloadBase64));
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return null;
    }
    return payload as AuthenticatedUser;
  } catch {
    return null;
  }
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function base64urlToBuffer(str: string): ArrayBuffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Verifies Bearer JWT and attaches verified user payload to request
export async function requireAuth(req: any, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = header.substring(7);
    const user = await verifyJWT(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Invalid token." });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Gates requests based on allowed roles
export function requireRole(allowedRoles: ("CUSTOMER" | "STAFF" | "ADMIN")[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please authenticate first." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}
