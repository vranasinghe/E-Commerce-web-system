"use client";

import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lines, subtotal, remove, setQty } = useCart();

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
            My Cart{lines.length > 0 ? ` (${lines.reduce((n, l) => n + l.quantity, 0)})` : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400">
              <ShoppingBag className="h-12 w-12 text-gray-200" />
              <p className="text-sm">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-xs font-semibold text-pink-600 underline hover:text-pink-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.variantId} className="flex gap-3 items-start">
                {/* Image */}
                <div className="relative h-16 w-14 shrink-0 bg-gray-100 overflow-hidden">
                  {line.image ? (
                    <Image src={line.image} alt={line.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
                    {line.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[line.color, line.size].filter(Boolean).join(" / ")}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {line.quantity} × {money(line.price)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => (line.quantity <= 1 ? remove(line.variantId) : setQty(line.variantId, line.quantity - 1))}
                      className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-pink-400 hover:text-pink-600 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-medium w-4 text-center">{line.quantity}</span>
                    <button
                      onClick={() => setQty(line.variantId, line.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-pink-400 hover:text-pink-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => remove(line.variantId)}
                  className="text-gray-300 hover:text-red-500 transition-colors mt-0.5 shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Subtotal</span>
              <span className="text-base font-bold text-gray-900">{money(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              id="cart-checkout-btn"
              className="block w-full py-3 text-center text-sm font-bold tracking-widest text-white uppercase transition-all duration-200"
              style={{ background: "#e6186c" }}
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              id="cart-view-btn"
              className="block w-full py-2.5 text-center text-sm font-semibold text-gray-800 border border-gray-800 hover:bg-gray-900 hover:text-white transition-all duration-200 tracking-wide"
            >
              View Shopping Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
