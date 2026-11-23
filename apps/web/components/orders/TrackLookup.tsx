"use client";

import { useState } from "react";
import { Button } from "@repo/ui";
import { lookupOrderAction } from "@/app/actions/order";
import type { TrackedOrder } from "@/lib/order-status";
import { OrderDetails } from "./OrderDetails";

// Guest order lookup. Details are posted via a server action (not put in the URL).
export function TrackLookup({ initialOrderNumber = "" }: { initialOrderNumber?: string }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const res = await lookupOrderAction(orderNumber, email);
      if ("error" in res) setError(res.error);
      else setOrder(res.order);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Order number</span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="AURA-XXXXXXXX"
            required
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Email used at checkout</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
          />
        </label>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {order && (
        <div className="rounded-xl border border-neutral-200 p-6">
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  );
}
