import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@repo/database";
import type { CartLine } from "@repo/types";
import { cookies } from "next/headers";
import { verifyJWT } from "../../../lib/auth";

export const runtime = "nodejs";

// Creates an order from the cart.
//
// Production would create a Stripe PaymentIntent, confirm it client-side with
// Stripe Elements, and finalise the order on the webhook. Here we persist the
// order directly (test mode) so the browse → cart → checkout flow is complete.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    email: string;
    lines: CartLine[];
  };

  const { email, lines } = body;
  if (!email || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "email and lines required" }, { status: 400 });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 6.95;
  const total = subtotal + shipping;
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
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        shipping: new Prisma.Decimal(shipping.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            name: l.name,
            size: l.size,
            color: l.color,
            quantity: l.quantity,
            price: new Prisma.Decimal(l.price.toFixed(2)),
          })),
        },
      },
    });

    // Best-effort stock decrement.
    await Promise.all(
      lines.map((l) =>
        prisma.productVariant.update({
          where: { id: l.variantId },
          data: { stock: { decrement: l.quantity } },
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
Total Amount: $${total.toFixed(2)}
============================================================
    `);

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "could not create order" }, { status: 500 });
  }
}
