import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }
  const user = await verifyJWT(token);
  return NextResponse.json({ user });
}
