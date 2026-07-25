"use client";

import { useWishlist } from "@/lib/wishlist-context";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, Trash2 } from "lucide-react";

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function WishlistDrawer({ open, onClose }: WishlistDrawerProps) {
  const { items, remove } = useWishlist();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm text-gray-900 tracking-wide uppercase">
            My Wish List{items.length > 0 ? ` (${items.length})` : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label="Close wishlist"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400">
              <Heart className="h-12 w-12 text-gray-200" />
              <p className="text-sm">Your wishlist is empty</p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-pink-600 underline hover:text-pink-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-3 items-start">
                {/* Image */}
                <div className="relative h-16 w-14 shrink-0 bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{money(item.price)}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => remove(item.variantId)}
                  className="text-gray-300 hover:text-red-500 transition-colors mt-0.5 shrink-0"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Link
            href="/cart"
            onClick={onClose}
            id="wishlist-view-cart-btn"
            className="block w-full py-2.5 text-center text-sm font-semibold text-gray-800 border border-gray-800 hover:bg-gray-900 hover:text-white transition-all duration-200 tracking-wide"
          >
            View Shopping Cart
          </Link>
        </div>
      </div>
    </>
  );
}
