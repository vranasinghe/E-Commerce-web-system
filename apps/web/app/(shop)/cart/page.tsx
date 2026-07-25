"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@repo/ui";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 75;

export default function CartPage() {
  const { lines, subtotal, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-neutral-300" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-neutral-500">Add something you love.</p>
        <Link href="/" className="mt-6">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 6.95;

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-2xl font-semibold">Cart</h1>
        <ul className="divide-y divide-neutral-100">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-4 py-4">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <Image src={l.image} alt={l.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <Link href={`/product/${l.slug}`} className="font-medium">
                    {l.name}
                  </Link>
                  <span>{formatPrice(l.price * l.quantity)}</span>
                </div>
                <p className="text-sm text-neutral-500">
                  {l.color} · {l.size}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-neutral-200">
                    <button
                      onClick={() => (l.quantity <= 1 ? remove(l.variantId) : setQty(l.variantId, l.quantity - 1))}
                      className="p-2"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{l.quantity}</span>
                    <button
                      onClick={() => setQty(l.variantId, l.quantity + 1)}
                      className="p-2"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(l.variantId)}
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="mt-3 text-xs text-neutral-500">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free
            shipping.
          </p>
        )}
        <Link href="/checkout" className="mt-6 block">
          <Button size="lg" className="w-full">
            Checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}
