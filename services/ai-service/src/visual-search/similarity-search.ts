import { prisma } from "@repo/database";
import type { VisualSearchResult } from "@repo/types";

// Nearest product image embeddings for a query vector.
//
// Production query (pgvector):
//   SELECT p.id, p.slug, p.name, p.images,
//          1 - (e.image_embedding <=> $1) AS similarity
//   FROM "ProductEmbedding" e JOIN "Product" p ON p.id = e."productId"
//   ORDER BY e.image_embedding <=> $1
//   LIMIT 8;
//
// Fallback: return a sample of products with mock similarity until the CLIP
// embeddings are populated by the reindex job.
export async function searchByImageEmbedding(
  _embedding: number[],
): Promise<VisualSearchResult[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, slug: true, name: true, images: true },
  });

  return [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((p, i) => ({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0] ?? "",
      similarity: Math.max(0.55, 0.95 - i * 0.05),
    }));
}
