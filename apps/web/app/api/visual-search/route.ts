import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) {
      return NextResponse.json({ error: "Choose a JPG, PNG, or WebP photo under 8 MB." }, { status: 422 });
    }

    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/search/visual` : `${API_URL}/api/ai/search/visual`;

    // Forward the multipart form-data to Express Gateway or directly to Python
    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(40000),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: typeof data.detail === "string" ? data.detail : "Image search is temporarily unavailable." }, { status: response.status });
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err: unknown) {
    console.error("Visual search proxy error:", err instanceof Error ? err.name : "Unknown error");
    return NextResponse.json({ error: "Image search is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
