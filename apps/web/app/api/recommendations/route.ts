import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4100";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ items: [] });
  }

  try {
    // Directly call Python microservice (cut one hop in proxy chain)
    const response = await fetch(`${AI_SERVICE_URL}/api/recommendations/${productId}`);
    if (!response.ok) {
      throw new Error(`Service returned status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Recommendations direct fetch error:", err);
    return NextResponse.json({ items: [] });
  }
}
