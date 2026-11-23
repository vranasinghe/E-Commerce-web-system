import { Check, ExternalLink, MapPin, Package } from "lucide-react";
import { formatPrice } from "@/lib/format";
import {
  STATUS_COLORS,
  STATUS_LABEL,
  TRACK_STEPS,
  carrierTrackingUrl,
  type TrackedOrder,
} from "@/lib/order-status";

function fmtDate(iso: string, withTime = false) {
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export interface ShippingAddressView {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Full tracking view for one order: status, progress timeline, shipment info, items.
 * The shipping address is only passed in on the signed-in account view, never on
 * the public order-number lookup.
 */
export function OrderDetails({
  order,
  shippingAddress,
}: {
  order: TrackedOrder;
  shippingAddress?: ShippingAddressView | null;
}) {
  const exception = order.status === "CANCELLED" || order.status === "RETURNED";
  const currentIdx = TRACK_STEPS.indexOf(order.status);
  const trackUrl = carrierTrackingUrl(order.carrier, order.trackingNumber);

  // When each step was first reached.
  const reachedAt = new Map<string, string>();
  for (const e of order.events) {
    if (!reachedAt.has(e.status)) reachedAt.set(e.status, e.createdAt);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500">Order</p>
          <p className="text-xl font-semibold">{order.orderNumber}</p>
          <p className="text-sm text-neutral-500">Placed {fmtDate(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_COLORS[order.status] ?? "bg-neutral-100"
          }`}
        >
          {order.status === "PAID" ? "Paid" : STATUS_LABEL[order.status]}
        </span>
      </div>

      {exception ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          This order was {order.status === "CANCELLED" ? "cancelled" : "returned"}.
        </p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-4">
          {TRACK_STEPS.map((step, i) => {
            const done = currentIdx >= i;
            const at = reachedAt.get(step);
            return (
              <li key={step} className="flex items-start gap-3 sm:flex-col sm:gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                    done
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-neutral-300 text-neutral-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div>
                  <p className={`text-sm font-medium ${done ? "" : "text-neutral-400"}`}>
                    {STATUS_LABEL[step]}
                  </p>
                  {at && <p className="text-xs text-neutral-500">{fmtDate(at)}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {(order.trackingNumber || order.estimatedDelivery) && (
        <div className="rounded-xl border border-neutral-200 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Package className="h-4 w-4" /> Shipment
          </p>
          <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {order.carrier && (
              <div className="flex justify-between sm:block">
                <dt className="text-neutral-500">Carrier</dt>
                <dd>{order.carrier}</dd>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex justify-between sm:block">
                <dt className="text-neutral-500">Tracking number</dt>
                <dd className="font-mono">{order.trackingNumber}</dd>
              </div>
            )}
            {order.estimatedDelivery && order.status !== "DELIVERED" && (
              <div className="flex justify-between sm:block">
                <dt className="text-neutral-500">Estimated delivery</dt>
                <dd>{fmtDate(order.estimatedDelivery)}</dd>
              </div>
            )}
          </dl>
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 underline"
            >
              Track with {order.carrier} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      {shippingAddress && (
        <div className="rounded-xl border border-neutral-200 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <MapPin className="h-4 w-4" /> Shipping to
          </p>
          <address className="mt-2 not-italic text-neutral-600">
            {shippingAddress.fullName}
            <br />
            {shippingAddress.line1}
            {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}
            <br />
            {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}
          </address>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold">Items</h2>
        <ul className="divide-y divide-neutral-100 text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between py-2">
              <span>
                {i.name} · {i.color}/{i.size} × {i.quantity}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {order.events.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">History</h2>
          <ul className="space-y-2 text-sm">
            {[...order.events].reverse().map((e, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="w-40 shrink-0 text-neutral-500">
                  {fmtDate(e.createdAt, true)}
                </span>
                <span>
                  <span className="font-medium">{STATUS_LABEL[e.status]}</span>
                  {e.note && <span className="text-neutral-500"> — {e.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
