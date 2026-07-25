import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${API_URL}/api/ai/chat`, {
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
