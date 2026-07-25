"use client";

import { useCompare, type CompareProduct } from "@/lib/compare-context";
import Image from "next/image";
import Link from "next/link";
import { X, BarChart2, Star, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function Stars({ rating = 0 }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

const ROWS: { label: string; key: keyof CompareProduct; format?: (v: any) => string }[] = [
  { label: "COLLECTION", key: "collection" },
  { label: "AVAILABILITY", key: "availability" },
  { label: "MATERIAL", key: "material" },
  { label: "VENDOR", key: "vendor" },
  { label: "SKU", key: "sku" },
  { label: "COLOR", key: "color" },
  { label: "SIZE", key: "size" },
  { label: "BARCODE", key: "barcode" },
];

export default function ComparePage() {
  const { products, remove, clear } = useCompare();
  const { add: addToCart } = useCart();
  const { toggle: toggleWishlist } = useWishlist();

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <BarChart2 className="h-16 w-16 text-gray-200" />
        <div>
          <h1 className="text-xl font-semibold text-gray-700 mb-2">No Products to Compare</h1>
          <p className="text-sm text-gray-400 mb-6">
            Browse our products and add them to your compare list.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 text-sm font-semibold text-white"
            style={{ background: "#e6186c" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product Comparison</h1>
          <p className="text-sm text-gray-400 mt-1">
            Comparing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={clear}
          className="text-sm text-gray-500 underline hover:text-red-500 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <tbody>
            {/* Products row — images + basic info */}
            <tr className="border-b border-gray-100">
              {/* Row label cell */}
              <td className="w-36 py-4 pr-6 text-xs font-semibold uppercase tracking-wider text-gray-400 align-top">
                PRODUCTS
              </td>

              {/* Product columns */}
              {products.map((p) => (
                <td key={p.productId} className="py-4 px-4 align-top text-center relative">
                  {/* Remove button */}
                  <button
                    onClick={() => remove(p.productId)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove from compare"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Product image */}
                  <div className="relative h-52 w-full bg-gray-50 mx-auto mb-3 overflow-hidden">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-cover object-center" />
                    ) : (
                      <div className="h-full w-full bg-gray-100" />
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{p.name}</p>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm font-bold" style={{ color: "#e6186c" }}>
                      {money(p.price)}
                    </span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {money(p.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  {p.rating !== undefined && (
                    <div className="flex justify-center mb-3">
                      <Stars rating={p.rating} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-center mt-3">
                    <button
                      onClick={() =>
                        addToCart({
                          productId: p.productId,
                          variantId: p.productId + "-default",
                          slug: p.productId,
                          name: p.name,
                          image: p.image,
                          price: p.price,
                          size: p.size || "",
                          color: p.color || "",
                          quantity: 1,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-all"
                      style={{ background: "#e6186c" }}
                      title="Add to cart"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() =>
                        toggleWishlist({
                          productId: p.productId,
                          variantId: p.productId + "-default",
                          name: p.name,
                          image: p.image,
                          price: p.price,
                        })
                      }
                      className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold border border-gray-300 text-gray-600 hover:border-pink-400 hover:text-pink-600 transition-all"
                      title="Add to wishlist"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              ))}
            </tr>

            {/* Attribute rows */}
            {ROWS.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-3 pr-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {row.label}
                </td>
                {products.map((p) => (
                  <td key={p.productId} className="py-3 px-4 text-sm text-gray-700 text-center">
                    {(p[row.key] as string | undefined) || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
