"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@repo/ui";

interface Props {
  clientSecret: string;
  publishableKey: string;
  payLabel: string;
  onBack: () => void;
  /** Called once Stripe reports the payment succeeded. Should finalise the order. */
  onPaid: (paymentIntentId: string) => Promise<void>;
}

export function StripePayment({ clientSecret, publishableKey, ...rest }: Props) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayForm {...rest} />
    </Elements>
  );
}

function PayForm({
  payLabel,
  onBack,
  onPaid,
}: Pick<Props, "payLabel" | "onBack" | "onPaid">) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once Stripe has charged the card, so a failed order save can be retried
  // without charging again.
  const [paidId, setPaidId] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    try {
      let intentId = paidId;
      if (!intentId) {
        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });
        if (stripeError) {
          setError(stripeError.message ?? "Payment failed");
          return;
        }
        if (paymentIntent?.status !== "succeeded") {
          setError(`Payment status: ${paymentIntent?.status ?? "unknown"}`);
          return;
        }
        intentId = paymentIntent.id;
        setPaidId(intentId);
      }
      await onPaid(intentId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong saving your order",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Demo mode — Stripe test environment. Use card{" "}
          <span className="font-mono">4242 4242 4242 4242</span>, any future expiry and
          any CVC. No real money is charged.
        </p>
        <PaymentElement />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="lg" disabled={!stripe || !elements || busy}>
          {busy ? "Processing…" : paidId ? "Retry saving order" : payLabel}
        </Button>
      </div>
    </form>
  );
}
