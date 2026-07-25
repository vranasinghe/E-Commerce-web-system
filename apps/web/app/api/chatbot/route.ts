import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // If user added AI_SERVICE_URL to Vercel, connect directly to Python AI Service
    // Bypassing the Node.js backend proxy which might be misconfigured
    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/chat` : `${API_URL}/api/ai/chat`;
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Service returned status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Chat proxy error:", err);
    return NextResponse.json(
      { reply: "I'm having trouble reaching the styling service right now. Please try again later." },
      { status: 200 }
    );
  }
}
