import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  try {
    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/tryon/status/${jobId}` : `${API_URL}/api/ai/tryon/status/${jobId}`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Status check returned code ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Status check error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
