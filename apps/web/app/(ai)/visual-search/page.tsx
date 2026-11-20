"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Sparkles } from "lucide-react";
import type { VisualSearchResponse } from "@repo/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024;

export default function VisualSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<VisualSearchResponse | null>(null);
  const [error, setError] = useState("");
  const previewRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    requestRef.current?.abort();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    requestRef.current?.abort();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    setSearch(null);
    setError("");
    setLoading(false);

    if (!ACCEPTED_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_SIZE) {
      setError("Choose a JPG, PNG, or WebP photo under 8 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;

    const body = new FormData();
    body.append("image", file);
    try {
      const response = await fetch("/api/visual-search", {
        method: "POST", body, signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image search is temporarily unavailable.");
      if (!controller.signal.aborted) setSearch(data as VisualSearchResponse);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "Image search is temporarily unavailable.");
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-1 pb-12">
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <Sparkles className="h-4 w-4" /> Shop by photo
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Find the clothes in your photo</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
          Upload a clear photo of one item. We&apos;ll identify its clothing category and show similar products available in our store.
        </p>
      </div>

      <label className="mx-auto mt-8 flex min-h-64 w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition-colors hover:border-neutral-500 focus-within:border-neutral-700 sm:p-10">
        {preview ? (
          <Image src={preview} alt="Your uploaded photo" width={200} height={250} unoptimized className="max-h-64 rounded-lg object-contain" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-neutral-500" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold">Choose a clothing photo</span>
            <span className="mt-1 text-xs text-neutral-500">JPG, PNG, or WebP · up to 8 MB</span>
          </>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} aria-label="Choose a clothing photo" />
      </label>

      {preview && <p className="mt-3 text-center text-xs text-neutral-500">Choose another photo to search again.</p>}
      <div role="status" aria-live="polite">
        {loading && <p className="mt-8 text-center text-neutral-600">Identifying the clothing and searching the catalog…</p>}
        {error && <p className="mx-auto mt-6 max-w-xl rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-800">{error}</p>}
      </div>

      {search && !loading && (
        <section className="mt-10" aria-label="Image search results">
          {search.category ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Detected category</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {search.category.parentName ? `${search.category.parentName} / ` : ""}{search.category.name}
                </h2>
                {search.description && <p className="mt-1 text-sm text-neutral-600">Looks like: {search.description}</p>}
              </div>
              <Link href={`/category/${search.category.slug}`} className="rounded-full border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 hover:text-white">
                Browse {search.category.name}
              </Link>
            </div>
          ) : (
            <p className="rounded-lg bg-neutral-50 px-4 py-5 text-center text-neutral-600">
              We couldn&apos;t identify a clothing category in this photo. Try a clearer picture of one item.
            </p>
          )}

          {search.results.length > 0 && (
            <>
              <h3 className="mb-4 mt-7 text-lg font-semibold">Similar products in our store</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
                {search.results.map((product) => (
                  <Link key={product.productId} href={`/product/${product.slug}`} className="group min-w-0">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
                      {product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain transition-transform group-hover:scale-105" />}
                    </div>
                    <p className="mt-2 text-sm font-medium group-hover:underline">{product.name}</p>
                    <p className="mt-1 text-sm text-neutral-600">${product.price.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
          {search.category && search.results.length === 0 && (
            <p className="mt-6 text-sm text-neutral-600">There are no matching products in this category right now.</p>
          )}
          {search.results.length > 0 && <p className="mt-7 text-xs text-neutral-500">These are similar catalog items, not an exact match guarantee.</p>}
        </section>
      )}
    </div>
  );
}
