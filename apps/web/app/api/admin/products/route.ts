import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      gender,
      categorySlug,
      basePrice,
      sizes,
      colors,
      featured,
      images,
    } = body;

    if (!name || !description || !gender || !categorySlug || !basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create the category
    let category = await prisma.category.findFirst({
      where: { slug: categorySlug },
    });

    if (!category) {
      // Try to find a parent category first
      const parentSlug = gender.toLowerCase();
      const parent = await prisma.category.findFirst({ where: { slug: parentSlug } });
      category = await prisma.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: `${parentSlug}-${categorySlug}-${Date.now()}`,
          parentId: parent?.id ?? null,
        },
      });
    }

    // Generate a unique slug from the product name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    // Build variants from sizes × colors
    const sizeList: string[] = sizes?.length ? sizes : ["M"];
    const colorList: string[] = colors?.length ? colors : ["Default"];
    const variants = sizeList.flatMap((size: string) =>
      colorList.map((color: string) => ({
        sku: `${slug}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-"),
        size,
        color,
        stock: 10,
        price: parseFloat(basePrice),
      }))
    );

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        gender: gender.toLowerCase(),
        brand: body.brand?.trim() || null,
        basePrice: parseFloat(basePrice),
        images: images ?? [],
        featured: featured ?? false,
        categoryId: category.id,
        variants: { create: variants },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    console.error("Add product error:", err);
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
