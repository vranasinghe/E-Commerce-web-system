import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@repo/database";
import type { CartLine } from "@repo/types";
import { cookies } from "next/headers";
import { verifyJWT } from "../../../lib/auth";
import { getStripe, priceCart } from "../../../lib/stripe";

export const runtime = "nodejs";

// Step 2 of checkout: finalise the order after the client has confirmed the
// Stripe PaymentIntent (test mode). Instead of trusting the browser, we fetch
// the PaymentIntent from Stripe and check that it succeeded and that the amount
// matches the server-computed cart total before creating the order.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    email: string;
    lines: CartLine[];
    paymentIntentId: string;
  };

  const { email, lines, paymentIntentId } = body;
  if (!email || !paymentIntentId || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json(
      { error: "email, lines and paymentIntentId required" },
      { status: 400 },
    );
  }

  let cart;
  try {
    cart = await priceCart(lines);
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: "payment not completed" }, { status: 402 });
    }
    if (intent.amount !== cart.amountCents) {
      return NextResponse.json({ error: "payment amount mismatch" }, { status: 409 });
    }
  } catch (err) {
    console.error("checkout verification error", err);
    return NextResponse.json({ error: "could not verify payment" }, { status: 400 });
  }

  // Idempotency: a PaymentIntent can only ever produce one order.
  const existing = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });
  if (existing) {
    return NextResponse.json({ orderNumber: existing.orderNumber });
  }

  const orderNumber = `AURA-${Date.now().toString(36).toUpperCase()}`;

  const token = cookies().get("auth_token")?.value;
  let userId: string | undefined = undefined;
  if (token) {
    const user = await verifyJWT(token);
    if (user) {
      userId = user.id;
    }
  }

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email,
        userId,
        status: "PAID",
        stripePaymentId: paymentIntentId,
        subtotal: new Prisma.Decimal(cart.subtotal.toFixed(2)),
        shipping: new Prisma.Decimal(cart.shipping.toFixed(2)),
        total: new Prisma.Decimal(cart.total.toFixed(2)),
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            price: new Prisma.Decimal(i.price.toFixed(2)),
          })),
        },
      },
    });

    // Best-effort stock decrement.
    await Promise.all(
      cart.items.map((i) =>
        prisma.productVariant.update({
          where: { id: i.variantId },
          data: { stock: { decrement: i.quantity } },
        }),
      ),
    ).catch(() => {});

    // Simulated Order Confirmation Email
    console.log(`
============================================================
📧 EMAIL SENT [Order Confirmation]
To: ${email}
Subject: Order Confirmed - ${orderNumber}

Thank you for your purchase at AURA!
Your order is currently processing.
Order Number: ${orderNumber}
Total Amount: $${cart.total.toFixed(2)}
============================================================
    `);

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "could not create order" }, { status: 500 });
  }
}
