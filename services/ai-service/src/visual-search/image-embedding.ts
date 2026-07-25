// CLIP image-embedding wrapper.
//
// Production: run the image through a CLIP image encoder (e.g. a hosted
// inference endpoint or an onnxruntime model) to produce a 512-dim vector,
// then normalise it. Store product image embeddings in
// ProductEmbedding.imageEmbedding.
//
// This stub returns a deterministic pseudo-embedding from the raw bytes so the
// similarity-search path can be exercised end-to-end without model infra.

const DIM = 512;

export async function embedImage(bytes: Buffer): Promise<number[]> {
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < bytes.length; i++) {
    vec[i % DIM] += bytes[i]! / 255;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}
