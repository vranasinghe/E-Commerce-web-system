import Stripe from "stripe";
import { prisma } from "@repo/database";
import type { CartLine } from "@repo/types";

// Demo build: Stripe is restricted to TEST mode. Live keys are refused so real
// cards can never be charged by this app.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!key.startsWith("sk_test_")) {
    throw new Error("Only Stripe test-mode keys (sk_test_...) are allowed in the demo");
  }
  return new Stripe(key);
}

export function getPublishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key || !key.startsWith("pk_test_")) {
    throw new Error("STRIPE_PUBLISHABLE_KEY must be a test-mode key (pk_test_...)");
  }
  return key;
}

export interface PricedCart {
  items: {
    productId: string;
    variantId: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  /** Total in the smallest currency unit (cents). */
  amountCents: number;
}

// Prices are always taken from the database, never from the client.
export async function priceCart(lines: CartLine[]): Promise<PricedCart> {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("cart is empty");
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: lines.map((l) => l.variantId) } },
    include: { product: true },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const items = lines.map((l) => {
    const v = byId.get(l.variantId);
    const quantity = Math.floor(Number(l.quantity));
    if (!v || !v.product.active) throw new Error(`unknown item: ${l.name}`);
    if (!Number.isFinite(quantity) || quantity < 1) throw new Error("invalid quantity");
    return {
      productId: v.productId,
      variantId: v.id,
      name: v.product.name,
      size: v.size,
      color: v.color,
      quantity,
      price: Number(v.price),
    };
  });

  const subtotalCents = items.reduce((s, i) => s + Math.round(i.price * 100) * i.quantity, 0);
  const shippingCents = subtotalCents >= 7500 ? 0 : 695;
  const amountCents = subtotalCents + shippingCents;

  return {
    items,
    subtotal: subtotalCents / 100,
    shipping: shippingCents / 100,
    total: amountCents / 100,
    amountCents,
  };
}
