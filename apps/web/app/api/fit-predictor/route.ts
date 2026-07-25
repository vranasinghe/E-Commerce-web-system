import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { heightCm, weightKg, fitPreference } = body;

    if (!heightCm || !weightKg) {
      return NextResponse.json({ error: "height and weight required" }, { status: 400 });
    }

    const payload = {
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      fitPreference: fitPreference || "regular",
    };

    const targetUrl = AI_SERVICE_URL ? `${AI_SERVICE_URL}/api/fit` : `${API_URL}/api/ai/fit`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Service returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Fit predictor proxy error:", err);
    return NextResponse.json(
      { error: "Could not fetch fit prediction", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
