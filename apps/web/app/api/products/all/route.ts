import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        images: p.images,
        gender: p.gender ?? "unisex",
        category: { name: p.category.name, slug: p.category.slug },
      }))
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
