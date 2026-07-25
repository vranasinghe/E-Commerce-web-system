"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Repeat, Search } from "lucide-react";
import { formatPrice, toNumber } from "@/lib/format";
import type { ProductCardData } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist-context";
import { useCompare } from "@/lib/compare-context";
import { useRouter } from "next/navigation";

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductShowcase({
  products,
}: {
  products: (ProductCardData & { featured?: boolean })[];
}) {
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { toggle: toggleCompare, isComparing } = useCompare();
  const router = useRouter();

  function handleWishlist(product: ProductCardData) {
    toggleWishlist({
      productId: product.slug,
      variantId: product.slug + "-default",
      name: product.name,
      image: product.images[0] ?? "",
      price: toNumber(product.basePrice),
    });
  }

  function handleCompare(product: ProductCardData & { featured?: boolean }) {
    toggleCompare({
      productId: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: toNumber(product.basePrice),
      collection: product.category?.name ?? undefined,
      vendor: product.brand ?? undefined,
    });
    router.push("/compare");
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {products.map((product, i) => {
        const image =
          product.images[0] ?? "https://picsum.photos/seed/placeholder/800/1000";
        const wishlisted = isWishlisted(product.slug + "-default");
        const comparing = isComparing(product.slug);

        return (
          <div key={product.slug} className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {product.featured && (
                  <span className="rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase text-white">
                    New
                  </span>
                )}
              </div>
              {i % 3 === 0 && (
                <span className="absolute right-3 top-3 rounded bg-[#e6186c] px-2 py-1 text-[10px] font-bold uppercase text-white">
                  Sale
                </span>
              )}

              {/* Hover action icons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {/* ♥ Wishlist */}
                <button
                  aria-label="Add to wishlist"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlist(product);
                  }}
                  title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow transition ${
                    wishlisted
                      ? "bg-[#e6186c] text-white"
                      : "bg-white text-neutral-700 hover:bg-[#e6186c] hover:text-white"
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={wishlisted ? "currentColor" : "none"}
                  />
                </button>

                {/* ⇆ Compare */}
                <button
                  aria-label="Compare"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCompare(product);
                  }}
                  title={comparing ? "Remove from compare" : "Add to compare"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full shadow transition ${
                    comparing
                      ? "bg-[#e6186c] text-white"
                      : "bg-white text-neutral-700 hover:bg-[#e6186c] hover:text-white"
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                </button>

                {/* 🔍 Quick View */}
                <Link
                  href={`/product/${product.slug}`}
                  aria-label="Quick view"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow transition hover:bg-[#e6186c] hover:text-white"
                >
                  <Search className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#e6186c]">
                {product.category?.name ?? product.brand ?? "Apparel"}
              </p>
              <Link
                href={`/product/${product.slug}`}
                className="mt-1 block text-sm font-medium text-neutral-900 hover:text-[#e6186c]"
              >
                {product.name}
              </Link>
              <div className="mt-1 flex justify-center">
                <Stars />
              </div>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {formatPrice(toNumber(product.basePrice))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
