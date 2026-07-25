"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@repo/ui";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

type Step = "address" | "payment" | "review" | "done";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    city: "",
    postalCode: "",
    country: "US",
  });

  const shipping = subtotal >= 75 ? 0 : 6.95;
  const total = subtotal + shipping;

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, address: form, lines }),
      });
      const data = await res.json();
      setOrderNumber(data.orderNumber ?? "AURA-DEMO");
      clear();
      setStep("done");
    } catch {
      setOrderNumber("AURA-DEMO");
      clear();
      setStep("done");
    } finally {
      setPlacing(false);
    }
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
        <Link href="/" className="mt-6">
          <Button>Continue shopping</Button>
        </Link>
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

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>

        {/* Step indicator */}
        <ol className="mb-8 flex gap-2 text-sm">
          {(["address", "payment", "review"] as Step[]).map((s, i) => (
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
              setStep("payment");
            }}
            className="space-y-4"
          >
            <Input label="Email" value={form.email} onChange={update("email")} type="email" required />
            <Input label="Full name" value={form.fullName} onChange={update("fullName")} required />
            <Input label="Address" value={form.line1} onChange={update("line1")} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={update("city")} required />
              <Input label="Postal code" value={form.postalCode} onChange={update("postalCode")} required />
            </div>
            <Button type="submit" size="lg">Continue to payment</Button>
          </form>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4" /> Card (Stripe test mode)
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                In production this mounts Stripe Elements. For the demo, use test
                card 4242 4242 4242 4242.
              </p>
              <div className="mt-3 grid gap-3">
                <input className="h-10 rounded-md border border-neutral-200 px-3 text-sm" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <input className="h-10 rounded-md border border-neutral-200 px-3 text-sm" placeholder="MM / YY" defaultValue="12 / 34" />
                  <input className="h-10 rounded-md border border-neutral-200 px-3 text-sm" placeholder="CVC" defaultValue="123" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("address")}>Back</Button>
              <Button size="lg" onClick={() => setStep("review")}>Review order</Button>
            </div>
          </div>
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("payment")}>Back</Button>
              <Button size="lg" onClick={placeOrder} disabled={placing}>
                {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
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
        className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
      />
    </label>
  );
}
