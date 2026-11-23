"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@repo/ui";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { StripePayment } from "@/components/checkout/StripePayment";

type Step = "address" | "review" | "payment" | "done";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [step, setStep] = useState<Step>("address");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "US",
  });

  // Ordering needs a signed-in account (the middleware also guards this page).
  // The order email always comes from the account, so it is shown read-only.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user: { email: string; name: string | null } | null }) => {
        if (cancelled) return;
        if (!data.user) {
          router.replace("/login?from=/checkout");
          return;
        }
        setForm((f) => ({
          ...f,
          email: data.user!.email,
          fullName: f.fullName || data.user!.name || "",
        }));
        setSignedIn(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login?from=/checkout");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function goToLogin() {
    router.replace("/login?from=/checkout");
  }

  const shipping = subtotal >= 75 ? 0 : 6.95;
  const total = subtotal + shipping;

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  // Create a Stripe PaymentIntent (test mode) and move to the payment step.
  async function startPayment() {
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      if (res.status === 401) return goToLogin();
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error ?? "Could not start payment");
      }
      setPayment({ clientSecret: data.clientSecret, publishableKey: data.publishableKey });
      setStep("payment");
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Could not start payment");
    } finally {
      setStarting(false);
    }
  }

  // Called after Stripe confirms the card payment: save the order server-side.
  async function finalizeOrder(paymentIntentId: string) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: form, lines, paymentIntentId }),
    });
    if (res.status === 401) {
      goToLogin();
      throw new Error("Your session expired. Please sign in again.");
    }
    const data = await res.json();
    if (!res.ok || !data.orderNumber) {
      throw new Error(data.error ?? "Could not save your order");
    }
    setOrderNumber(data.orderNumber);
    clear();
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Check className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Order confirmed</h1>
        <p className="mt-1 text-neutral-500">
          Thanks! Your order{" "}
          <span className="font-medium text-neutral-900">{orderNumber}</span> is on
          its way.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href={`/account/orders/${encodeURIComponent(orderNumber ?? "")}`}>
            <Button variant="outline">Track your order</Button>
          </Link>
          <Link href="/">
            <Button>Continue shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center text-neutral-500">
        Your cart is empty.{" "}
        <Link href="/" className="underline">
          Shop now
        </Link>
      </div>
    );
  }

  if (!signedIn) {
    return <div className="py-24 text-center text-neutral-500">Checking your account…</div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>

        {/* Step indicator */}
        <ol className="mb-8 flex gap-2 text-sm">
          {(["address", "review", "payment"] as Step[]).map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 ${
                step === s ? "font-semibold text-neutral-900" : "text-neutral-400"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border">
                {i + 1}
              </span>
              <span className="capitalize">{s}</span>
              {i < 2 && <span className="mx-2 text-neutral-300">—</span>}
            </li>
          ))}
        </ol>

        {step === "address" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("review");
            }}
            className="space-y-4"
          >
            <Input label="Email" value={form.email} type="email" readOnly required
              title="Orders use the email of the account you are signed in with" />
            <Input label="Full name" value={form.fullName} onChange={update("fullName")} required />
            <Input label="Address" value={form.line1} onChange={update("line1")} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={update("city")} required />
              <Input label="Postal code" value={form.postalCode} onChange={update("postalCode")} required />
            </div>
            <Button type="submit" size="lg">Continue to review</Button>
          </form>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 text-sm">
              <p className="font-medium">Ship to</p>
              <p className="mt-1 text-neutral-600">
                {form.fullName}, {form.line1}, {form.city} {form.postalCode}
              </p>
              <p className="text-neutral-600">{form.email}</p>
            </div>
            <ul className="divide-y divide-neutral-100 text-sm">
              {lines.map((l) => (
                <li key={l.variantId} className="flex justify-between py-2">
                  <span>
                    {l.name} · {l.color}/{l.size} × {l.quantity}
                  </span>
                  <span>{formatPrice(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            {startError && <p className="text-sm text-red-600">{startError}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("address")}>Back</Button>
              <Button size="lg" onClick={startPayment} disabled={starting}>
                {starting ? "Preparing payment…" : "Continue to payment"}
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && payment && (
          <StripePayment
            clientSecret={payment.clientSecret}
            publishableKey={payment.publishableKey}
            payLabel={`Pay ${formatPrice(total)}`}
            onBack={() => setStep("review")}
            onPaid={finalizeOrder}
          />
        )}
      </div>

      <aside className="h-fit rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold">Summary</h2>
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
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400 read-only:bg-neutral-50 read-only:text-neutral-500"
      />
    </label>
  );
}
