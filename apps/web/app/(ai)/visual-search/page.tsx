"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Sparkles } from "lucide-react";
import type { VisualSearchResult } from "@repo/types";

export default function VisualSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VisualSearchResult[] | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResults(null);
    setLoading(true);

    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch("/api/visual-search", { method: "POST", body });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-neutral-400">
          <Sparkles className="h-4 w-4" /> AI Visual Search
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Snap it. Find it.</h1>
        <p className="mt-2 text-neutral-500">
          Upload a photo and we&apos;ll find similar pieces in the catalog using
          CLIP image embeddings.
        </p>
      </div>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-10 text-center hover:border-neutral-400">
        {preview ? (
          <Image
            src={preview}
            alt="Uploaded"
            width={200}
            height={250}
            className="rounded-lg object-cover"
          />
        ) : (
          <>
            <Upload className="h-8 w-8 text-neutral-400" />
            <span className="mt-2 text-sm font-medium">Click to upload a photo</span>
            <span className="text-xs text-neutral-400">JPG or PNG</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>

      {preview && (
        <p className="mt-3 text-center text-xs text-neutral-400">
          Click the box again to try a different photo.
        </p>
      )}

      {loading && (
        <p className="mt-8 text-center text-neutral-500">Analyzing image…</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Matching products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {results.map((r) => (
              <Link key={r.productId} href={`/product/${r.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={r.image} alt={r.name} fill className="object-cover" />
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs">
                    {Math.round(r.similarity * 100)}%
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-medium">{r.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && !loading && (
        <p className="mt-8 text-center text-neutral-500">
          No confident matches. (Tip: run the embeddings job so the vector index is
          populated — see README.)
        </p>
      )}
    </div>
  );
}
