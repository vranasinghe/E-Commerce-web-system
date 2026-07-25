import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userImage = formData.get("user_image");
    const garmentImage = formData.get("garment_image");
    
    if (!userImage || !garmentImage) {
      return NextResponse.json({ error: "Both user_image and garment_image are required." }, { status: 400 });
    }

    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/tryon` : `${API_URL}/api/ai/tryon`;

    // Forward the multipart form-data to Express Gateway or directly to Python
    const response = await fetch(targetUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Service returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Tryon proxy error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
