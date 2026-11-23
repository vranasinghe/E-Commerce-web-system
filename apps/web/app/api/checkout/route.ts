import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@repo/database";
import type { CartLine } from "@repo/types";
import { getSession } from "../../../lib/auth";
import { getStripe, priceCart } from "../../../lib/stripe";

export const runtime = "nodejs";

// Step 2 of checkout: finalise the order after the client has confirmed the
// Stripe PaymentIntent (test mode). Instead of trusting the browser, we fetch
// the PaymentIntent from Stripe and check that it succeeded and that the amount
// matches the server-computed cart total before creating the order.
// Orders always belong to the signed-in account: the email and owner come from
// the session, never from the request body.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  const body = (await req.json()) as {
    lines: CartLine[];
    paymentIntentId: string;
    address?: Partial<Record<"fullName" | "line1" | "city" | "postalCode" | "country", string>>;
  };

  const { lines, paymentIntentId } = body;
  const address = {
    fullName: body.address?.fullName?.trim() ?? "",
    line1: body.address?.line1?.trim() ?? "",
    city: body.address?.city?.trim() ?? "",
    postalCode: body.address?.postalCode?.trim() ?? "",
    country: body.address?.country?.trim() || "US",
  };
  if (!paymentIntentId || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "lines and paymentIntentId required" }, { status: 400 });
  }
  if (!address.fullName || !address.line1 || !address.city || !address.postalCode) {
    return NextResponse.json({ error: "A complete shipping address is required" }, { status: 400 });
  }
  const email = session.email;

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
    // The payment must have been started by this same account.
    if (intent.metadata?.userId !== session.id) {
      return NextResponse.json({ error: "payment does not belong to this account" }, { status: 403 });
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

  try {
    const shippingAddress = await prisma.address.create({
      data: { userId: session.id, ...address },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        email,
        userId: session.id,
        shippingAddressId: shippingAddress.id,
        status: "PAID",
        stripePaymentId: paymentIntentId,
        events: { create: { status: "PAID", note: "Payment received" } },
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
