"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, Heart, Repeat, Ruler, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCompare } from "@/lib/compare-context";
import { toNumber } from "@/lib/format";
import { TryOnModal } from "@/components/ai/TryOnModal";
import { useRouter } from "next/navigation";

export interface VariantData {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: unknown;
}

/* Map named colours to CSS colour values */
const COLOR_MAP: Record<string, string> = {
  black: "#111827",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  navy: "#1e3a5f",
  green: "#22c55e",
  emerald: "#10b981",
  gray: "#9ca3af",
  grey: "#9ca3af",
  pink: "#ec4899",
  purple: "#a855f7",
  yellow: "#eab308",
  orange: "#f97316",
  brown: "#92400e",
  beige: "#d4b896",
};

function colorToCSS(color: string): string {
  return COLOR_MAP[color.toLowerCase()] ?? "#9ca3af";
}

export function AddToCart({
  productId,
  slug,
  name,
  image,
  variants,
  vendor,
  category,
}: {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variants: VariantData[];
  vendor?: string | null;
  category?: string | null;
}) {
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants],
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants],
  );

  const [color, setColor] = useState(colors[0] ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const { add: addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { toggle: toggleCompare } = useCompare();
  const router = useRouter();

  const selected = variants.find((v) => v.color === color && v.size === size);
  const inStock = selected ? selected.stock > 0 : false;
  const price = selected
    ? toNumber(selected.price)
    : toNumber(variants[0]?.price ?? 0);
  const totalStock = selected?.stock ?? 0;

  const variantId = selected?.id ?? slug + "-default";
  const wishlisted = isWishlisted(variantId);

  function stockFor(sz: string) {
    return variants.find((v) => v.color === color && v.size === sz)?.stock ?? 0;
  }

  function handleAdd() {
    if (!selected) return;
    addToCart({
      productId,
      variantId: selected.id,
      slug,
      name,
      image,
      size: selected.size,
      color: selected.color,
      price: toNumber(selected.price),
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleWishlist() {
    toggleWishlist({
      productId: slug,
      variantId,
      name,
      image,
      price,
      color: color || undefined,
      size: size || undefined,
    });
  }

  function handleCompare() {
    toggleCompare({
      productId: slug,
      name,
      image,
      price,
      collection: category ?? undefined,
      vendor: vendor ?? undefined,
      color: color || undefined,
      size: size || undefined,
    });
    router.push("/compare");
  }

  return (
    <div className="space-y-5">

      {/* Vendor / Availability / Product Type */}
      <div className="space-y-1 text-sm text-gray-600 border-b border-gray-100 pb-4">
        {vendor && (
          <p><span className="font-medium text-gray-800">Vendor:</span> {vendor}</p>
        )}
        <p>
          <span className="font-medium text-gray-800">Availability:</span>{" "}
          {selected ? (
            selected.stock > 0 ? (
              <span className="text-green-600 font-medium">In Stock ({selected.stock} items)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )
          ) : (
            <span className="text-gray-400">Select a variant</span>
          )}
        </p>
        {category && (
          <p><span className="font-medium text-gray-800">Products Type:</span> {category}</p>
        )}
      </div>

      {/* Color selector — circles */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Color: <span className="font-normal text-gray-500">{color}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => {
                  setColor(c);
                  setSize(null);
                }}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  c === color
                    ? "border-pink-500 ring-2 ring-pink-300 ring-offset-1"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                style={{ background: colorToCSS(c) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector — squares */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Size:</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTryOnOpen(true)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-900 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-indigo-100" />
                Virtual Try-On
              </button>
              <Link
                href="/fit-finder"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
              >
                <Ruler className="h-3.5 w-3.5" /> Find my size
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const disabled = stockFor(sz) === 0;
              return (
                <button
                  key={sz}
                  disabled={disabled}
                  onClick={() => setSize(sz)}
                  className={`min-w-[40px] h-9 px-2.5 border text-sm font-medium transition-all ${
                    sz === size
                      ? "border-pink-500 bg-pink-500 text-white"
                      : disabled
                      ? "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:border-gray-700"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Guide / Shipping / Ask links */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <button className="flex items-center gap-1 hover:text-gray-800 transition-colors">
          📐 Size Guide
        </button>
        <button className="flex items-center gap-1 hover:text-gray-800 transition-colors">
          🚚 Shipping
        </button>
        <button className="flex items-center gap-1 hover:text-gray-800 transition-colors">
          ✉️ Ask About This Product
        </button>
      </div>

      {/* Qty + Add to Cart */}
      <div className="flex gap-3 items-center">
        {/* Qty stepper */}
        <div className="flex items-center border border-gray-300">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-medium text-gray-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(totalStock || 99, q + 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          disabled={!size || !inStock}
          onClick={handleAdd}
          className={`flex-1 py-2.5 px-6 text-sm font-bold uppercase tracking-widest text-white transition-all ${
            !size || !inStock
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#e6186c] hover:bg-[#c91561] active:scale-95"
          }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> Added!
            </span>
          ) : !size ? (
            "Select a Size"
          ) : !inStock ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>

      {/* Wishlist + Compare */}
      <div className="flex gap-3">
        <button
          onClick={handleWishlist}
          className={`flex flex-1 items-center justify-center gap-2 border py-2.5 text-sm font-medium transition-all ${
            wishlisted
              ? "border-pink-500 bg-pink-50 text-pink-600"
              : "border-gray-300 text-gray-700 hover:border-pink-400 hover:text-pink-600"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={wishlisted ? "currentColor" : "none"}
          />
          {wishlisted ? "In Wish List" : "Add to Wish List"}
        </button>
        <button
          onClick={handleCompare}
          className="flex flex-1 items-center justify-center gap-2 border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-700 transition-all"
        >
          <Repeat className="h-4 w-4" />
          Add to Compare
        </button>
      </div>

      <TryOnModal
        productName={name}
        garmentImage={image}
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
      />
    </div>
  );
}
