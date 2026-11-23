// Pure (no database access) so it is safe to import from client components.
import type { OrderStatus } from "@repo/database";

// Happy-path steps shown on the tracking timeline.
export const TRACK_STEPS: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Order placed & paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-neutral-200 text-neutral-700",
};

export const CARRIERS = ["DHL", "FedEx", "UPS", "USPS", "Other"] as const;

/** Public carrier tracking page for a tracking number, when we know the carrier. */
export function carrierTrackingUrl(carrier: string | null, trackingNumber: string | null) {
  if (!carrier || !trackingNumber) return null;
  const n = encodeURIComponent(trackingNumber);
  switch (carrier) {
    case "DHL":
      return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${n}`;
    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "UPS":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    default:
      return null;
  }
}

// Plain, serializable shape used by the tracking UI (safe to pass to client components).
export interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  shipping: number;
  subtotal: number;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  items: { name: string; size: string; color: string; quantity: number; price: number }[];
  events: { status: OrderStatus; note: string | null; createdAt: string }[];
}
