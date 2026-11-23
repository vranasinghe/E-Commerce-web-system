import { NextRequest, NextResponse } from "next/server";
import type { CartLine } from "@repo/types";
import { getSession } from "../../../../lib/auth";
import { getPublishableKey, getStripe, priceCart } from "../../../../lib/stripe";

export const runtime = "nodejs";

// Step 1 of checkout: create a Stripe PaymentIntent (test mode) for the cart.
// The amount is computed on the server from database prices.
// Only signed-in customers can pay, so no PaymentIntent is created for guests.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }
  const { lines } = (await req.json()) as { lines: CartLine[] };

  try {
    const cart = await priceCart(lines);
    const stripe = getStripe();

    const intent = await stripe.paymentIntents.create({
      amount: cart.amountCents,
      currency: "usd",
      // Payment methods are managed in the Stripe Dashboard
      // (Settings → Payment methods); redirect-based ones are handled via return_url.
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: session.email,
      metadata: { demo: "true", items: String(cart.items.length), userId: session.id },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      publishableKey: getPublishableKey(),
      amount: cart.total,
    });
  } catch (err) {
    console.error("payment-intent error", err);
    const message = err instanceof Error ? err.message : "could not start payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
