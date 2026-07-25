import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-aura-key-value-123456789";

export interface JWTPayload {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
}

export async function getSession() {
  try {
    const token = cookies().get("auth_token")?.value;
    if (!token) return null;
    return verifyJWT(token);
  } catch {
    return null;
  }
}

// HMAC-SHA256 JWT generation using Web Crypto (Edge-safe)
export async function signJWT(payload: JWTPayload, secret = JWT_SECRET): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const headerBase64 = base64url(JSON.stringify(header));
  const payloadBase64 = base64url(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
  }));
  const data = encoder.encode(`${headerBase64}.${payloadBase64}`);
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureBase64 = base64urlBuffer(signature);
  return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
}

export async function verifyJWT(token: string, secret = JWT_SECRET): Promise<JWTPayload | null> {
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
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Password hashing & verification
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return "seed$" + hashHex;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

// Helper functions for base64url
function base64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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

function base64urlBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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
