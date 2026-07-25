import { prisma } from "@repo/database";

// Server-side data access helpers used by React Server Components.

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export function getNewArrivals() {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export function getTopCategories() {
  return prisma.category.findMany({
    where: { parentId: { not: null } },
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getProductsByCategory(
  slug: string,
  opts: { sort?: string; color?: string; maxPrice?: number } = {},
) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { category: null, products: [] };

  // Include child categories if this is a parent.
  const childIds = (
    await prisma.category.findMany({
      where: { parentId: category.id },
      select: { id: true },
    })
  ).map((c) => c.id);

  const orderBy =
    opts.sort === "price-asc"
      ? { basePrice: "asc" as const }
      : opts.sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: { in: [category.id, ...childIds] },
      ...(opts.maxPrice ? { basePrice: { lte: opts.maxPrice } } : {}),
      ...(opts.color
        ? { variants: { some: { color: { equals: opts.color, mode: "insensitive" } } } }
        : {}),
    },
    include: { category: true },
    orderBy,
  });

  return { category, products };
}

export function searchProducts(q: string) {
  return prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { category: true },
    take: 40,
  });
}
