import { prisma } from "@repo/database";
import {
  embedText,
  productEmbeddingInput,
} from "../src/recommendations/embedding.generator";

// Batch job: (re)generate product text embeddings and upsert them into
// ProductEmbedding. Run on a schedule (cron) or after products change.
//
// NOTE: writing pgvector columns via Prisma requires raw SQL because the
// `vector` type is Unsupported() in the schema. The example write below is
// commented out — wire it to your embeddings provider and pgvector column.
//
//   await prisma.$executeRaw`
//     INSERT INTO "ProductEmbedding" (id, "productId", text_embedding, "updatedAt")
//     VALUES (${cuid()}, ${p.id}, ${vectorLiteral}::vector, now())
//     ON CONFLICT ("productId")
//     DO UPDATE SET text_embedding = EXCLUDED.text_embedding, "updatedAt" = now();
//   `;
async function main() {
  console.log("🔁  Reindexing product embeddings...");
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
  });

  let count = 0;
  for (const p of products) {
    const input = productEmbeddingInput(p);
    const vector = await embedText(input);
    // TODO: persist `vector` into ProductEmbedding.text_embedding via raw SQL.
    void vector;
    count++;
  }

  console.log(`✅  Computed embeddings for ${count} products.`);
  console.log(
    "   (Persistence is stubbed — see the raw-SQL example in this file to store vectors.)",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
