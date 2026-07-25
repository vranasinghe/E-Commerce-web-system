import { prisma } from "@repo/database";
import type { RecommendationItem } from "@repo/types";

// "You may also like" — nearest-neighbour over product embeddings.
//
// Production query (pgvector, cosine distance):
//   SELECT p.id, p.slug, p.name, p."basePrice", p.images,
//          1 - (e.text_embedding <=> $1) AS score
//   FROM "ProductEmbedding" e JOIN "Product" p ON p.id = e."productId"
//   WHERE p.id <> $2
//   ORDER BY e.text_embedding <=> $1
//   LIMIT 6;
//
// Fallback below: same-category / same-brand with price-proximity scoring.
export async function recommendForProduct(
  productId: string,
): Promise<RecommendationItem[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, categoryId: true, brand: true, basePrice: true },
  });
  if (!product) return [];

  const candidates = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      OR: [{ categoryId: product.categoryId }, { brand: product.brand ?? undefined }],
    },
    select: { id: true, slug: true, name: true, basePrice: true, images: true },
    take: 12,
  });

  const base = Number(product.basePrice);
  return candidates
    .map((c) => {
      const price = Number(c.basePrice);
      return {
        productId: c.id,
        slug: c.slug,
        name: c.name,
        price,
        image: c.images[0] ?? "",
        score: 1 / (1 + Math.abs(price - base) / 50),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
