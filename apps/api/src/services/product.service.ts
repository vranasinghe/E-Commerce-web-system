import { prisma } from "@repo/database";

export const productService = {
  list(opts: { category?: string; q?: string } = {}) {
    return prisma.product.findMany({
      where: {
        active: true,
        ...(opts.category ? { category: { slug: opts.category } } : {}),
        ...(opts.q
          ? { name: { contains: opts.q, mode: "insensitive" as const } }
          : {}),
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    });
  },

  getBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true, variants: true, reviews: true },
    });
  },

  upsertEmbedding(productId: string, textEmbedding: number[], imageEmbedding: number[]) {
    return prisma.productEmbedding.upsert({
      where: { productId },
      create: {
        productId,
        textEmbedding,
        imageEmbedding,
      },
      update: {
        textEmbedding,
        imageEmbedding,
      },
    });
  },
};
