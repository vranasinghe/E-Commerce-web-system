"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RecommendationItem } from "@repo/types";
import { formatPrice } from "@/lib/format";

export function RecommendationCarousel({
  productId,
  title = "You may also like",
}: {
  productId: string;
  title?: string;
}) {
  const [items, setItems] = useState<RecommendationItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recommendations?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (items && items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {(items ?? Array.from({ length: 4 })).map((item, i) =>
          item ? (
            <Link
              key={item.productId}
              href={`/product/${item.slug}`}
              className="w-40 shrink-0"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
              <p className="text-sm text-neutral-500">{formatPrice(item.price)}</p>
            </Link>
          ) : (
            <div
              key={i}
              className="h-52 w-40 shrink-0 animate-pulse rounded-lg bg-neutral-100"
            />
          ),
        )}
      </div>
    </section>
  );
}
