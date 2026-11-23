"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { toNumber } from "@/lib/format";

export interface QuickAddVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: unknown;
}

export interface QuickAddProduct {
  id?: string;
  slug: string;
  name: string;
  image: string;
  variants?: QuickAddVariant[];
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 100 : i;
};

/**
 * "Quick add" for product tiles: a bar over the bottom of the image that opens a
 * small size picker and adds the item to the cart without leaving the page.
 *
 * Must be rendered inside a `relative group` image box. Hidden until the tile is
 * hovered or focused on devices that can hover, and always visible on touch
 * devices (where hover never happens).
 */
export function QuickAdd({ product }: { product: QuickAddProduct }) {
  const { add } = useCart();
  const variants = product.variants ?? [];
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants],
  );
  const firstColorInStock =
    colors.find((c) => variants.some((v) => v.color === c && v.stock > 0)) ?? colors[0] ?? "";

  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(firstColorInStock);
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const sizes = useMemo(
    () =>
      variants
        .filter((v) => v.color === color)
        .sort((a, b) => sizeRank(a.size) - sizeRank(b.size)),
    [variants, color],
  );

  const soldOut = variants.length > 0 && variants.every((v) => v.stock <= 0);

  // Always visible on touch devices; slides up on hover/focus elsewhere.
  const barVisibility =
    "translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:none)]:translate-y-0";

  // No variant data (e.g. demo products): fall back to the product page.
  if (variants.length === 0 || !product.id) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className={`absolute inset-x-0 bottom-0 z-10 bg-black/70 py-2.5 text-center text-xs font-semibold text-white transition-transform duration-300 ${barVisibility}`}
      >
        View options
      </Link>
    );
  }

  if (soldOut) {
    return (
      <div
        className={`absolute inset-x-0 bottom-0 z-10 bg-neutral-500/80 py-2.5 text-center text-xs font-semibold text-white transition-transform duration-300 ${barVisibility}`}
      >
        Sold out
      </div>
    );
  }

  async function addVariant(v: QuickAddVariant) {
    const ok = await add({
      productId: product.id!,
      variantId: v.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: v.size,
      color: v.color,
      price: toNumber(v.price),
      quantity: 1,
    });
    if (!ok) return; // signed out: the sign-in prompt is showing
    setAddedSize(v.size);
    setTimeout(() => {
      setAddedSize(null);
      setOpen(false);
    }, 1200);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`absolute inset-x-0 bottom-0 z-10 bg-black/70 py-2.5 text-center text-xs font-semibold text-white transition-transform duration-300 hover:bg-black/85 ${barVisibility}`}
        >
          + Quick Add
        </button>
      )}

      {open && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-white/95 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-900">
              {addedSize ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="h-3.5 w-3.5" /> Added to cart
                </span>
              ) : (
                "Select a size"
              )}
            </p>
            <button
              type="button"
              aria-label="Close quick add"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-neutral-500 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {colors.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    c === color
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {sizes.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock <= 0 || addedSize !== null}
                onClick={() => addVariant(v)}
                className={`min-w-9 rounded border px-2 py-1 text-xs font-medium transition ${
                  v.stock <= 0
                    ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                    : addedSize === v.size
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-neutral-300 text-neutral-800 hover:border-neutral-900"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
