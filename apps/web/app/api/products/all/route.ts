import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          select: { id: true, size: true, color: true, stock: true, price: true },
          orderBy: [{ color: "asc" }, { size: "asc" }],
        },
      },
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
        variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
      }))
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
