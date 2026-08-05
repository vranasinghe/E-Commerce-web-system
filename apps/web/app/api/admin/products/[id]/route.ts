import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err: unknown) {
    console.error("Fetch product error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
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
      brand,
    } = body;

    if (!name || !description || !gender || !categorySlug || !basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Find or create category
    let category = await prisma.category.findFirst({
      where: { slug: categorySlug },
    });

    if (!category) {
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

    const priceNum = parseFloat(basePrice);

    // Update Product record
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name.trim(),
        description: description.trim(),
        gender: gender.toLowerCase(),
        brand: brand ? brand.trim() : null,
        basePrice: priceNum,
        images: images ?? [],
        featured: featured ?? false,
        categoryId: category.id,
      },
    });

    // Handle variants: selected sizes x colors
    const sizeList: string[] = sizes?.length ? sizes : ["M"];
    const colorList: string[] = colors?.length ? colors : ["Default"];

    // Build combination list of required (size, color)
    const activeCombinations = new Set<string>();
    for (const size of sizeList) {
      for (const color of colorList) {
        const comboKey = `${size}:${color}`;
        activeCombinations.add(comboKey);

        const sku = `${updatedProduct.slug}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-");

        await prisma.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: productId,
              size,
              color,
            },
          },
          update: {
            price: priceNum,
          },
          create: {
            productId: productId,
            sku,
            size,
            color,
            stock: 10,
            price: priceNum,
          },
        });
      }
    }

    // Optionally delete variants no longer in active combinations (if safe)
    for (const variant of existingProduct.variants) {
      const comboKey = `${variant.size}:${variant.color}`;
      if (!activeCombinations.has(comboKey)) {
        try {
          await prisma.productVariant.delete({
            where: { id: variant.id },
          });
        } catch {
          // Ignore delete error if variant is linked to orders/cart
        }
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: unknown) {
    console.error("Update product error:", err);
    const message = err instanceof Error ? err.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
