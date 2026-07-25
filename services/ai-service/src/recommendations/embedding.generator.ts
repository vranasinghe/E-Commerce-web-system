// Generates text embeddings for products.
//
// Production: call an embeddings provider (OpenAI text-embedding-3-small → 1536
// dims, or Claude-adjacent) on `${title}\n${description}\n${category}` and store
// the vector in ProductEmbedding.textEmbedding (pgvector).
//
// This stub returns a deterministic pseudo-embedding so the pipeline is testable
// without an API key. Replace `embedText` with a real provider call.

const DIM = 1536;

export async function embedText(text: string): Promise<number[]> {
  // Deterministic hash-based pseudo-embedding (NOT semantically meaningful).
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % DIM] += text.charCodeAt(i) / 255;
  }
  // L2 normalise.
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function productEmbeddingInput(p: {
  name: string;
  description: string;
  category: { name: string };
}): string {
  return `${p.name}\n${p.description}\n${p.category.name}`;
}
