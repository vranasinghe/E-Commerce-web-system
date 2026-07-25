import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  try {
    const response = await fetch(`${API_URL}/api/ai/tryon/status/${jobId}`);
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
