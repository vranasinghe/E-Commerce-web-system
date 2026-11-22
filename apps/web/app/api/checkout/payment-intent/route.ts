import { NextRequest, NextResponse } from "next/server";
import type { CartLine } from "@repo/types";
import { CheckoutError, getPublishableKey, getStripe, priceCart } from "../../../../lib/stripe";

export const runtime = "nodejs";

// Step 1 of checkout: create a Stripe PaymentIntent (test mode) for the cart.
// The amount is computed on the server from database prices.
export async function POST(req: NextRequest) {
  const { email, lines } = (await req.json()) as { email?: string; lines: CartLine[] };

  try {
    const cart = await priceCart(lines, { checkStock: true });
    const stripe = getStripe();

    const intent = await stripe.paymentIntents.create({
      amount: cart.amountCents,
      currency: "usd",
      // Payment methods are managed in the Stripe Dashboard
      // (Settings → Payment methods); redirect-based ones are handled via return_url.
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: email || undefined,
      metadata: { demo: "true", items: String(cart.items.length) },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      publishableKey: getPublishableKey(),
      amount: cart.total,
    });
  } catch (err) {
    // Cart/stock problems are the shopper's to fix, so say what they are.
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    // Anything else (missing/invalid Stripe keys, Stripe or database outage) is a
    // server problem: keep the detail in the logs, not in the shopper's browser.
    console.error("payment-intent error", err);
    return NextResponse.json(
      { error: "Payment is temporarily unavailable. Please try again in a few minutes." },
      { status: 503 },
    );
  }
}
