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
    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/tryon/result/${jobId}` : `${API_URL}/api/ai/tryon/result/${jobId}`;
    
    const response = await fetch(targetUrl, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "The preview is unavailable. Please try again." }));
      return NextResponse.json(data, { status: response.status, headers: { "Cache-Control": "no-store" } });
    }
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: unknown) {
    console.error("Result check error:", err);
    return NextResponse.json({ error: "The preview could not be loaded. Please try again." }, { status: 502 });
  }
}
