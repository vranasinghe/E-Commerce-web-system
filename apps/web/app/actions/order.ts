"use server";

import { prisma, type OrderStatus } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { setOrderStatus, toTrackedOrder, trackedOrderInclude } from "@/lib/orders";
import { ALL_STATUSES, type TrackedOrder } from "@/lib/order-status";

// ── Admin: change status / add tracking info ────────────────────────────────
export async function updateOrderTrackingAction(
  orderId: string,
  input: {
    status: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string; // yyyy-mm-dd or ""
    note: string;
  },
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return { error: "Unauthorized" };
  }

  if (!ALL_STATUSES.includes(input.status as OrderStatus)) {
    return { error: "Invalid status" };
  }
  const status = input.status as OrderStatus;
  const trackingNumber = input.trackingNumber.trim();
  const carrier = input.carrier.trim();

  if (status === "SHIPPED" && !trackingNumber) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { trackingNumber: true },
    });
    if (!existing?.trackingNumber) {
      return { error: "Enter a tracking number before marking an order as shipped" };
    }
  }

  let estimatedDelivery: Date | null | undefined = undefined;
  if (input.estimatedDelivery) {
    const d = new Date(input.estimatedDelivery);
    if (Number.isNaN(d.getTime())) return { error: "Invalid delivery date" };
    estimatedDelivery = d;
  }

  try {
    await setOrderStatus(orderId, {
      status,
      trackingNumber: trackingNumber || undefined,
      carrier: carrier || undefined,
      estimatedDelivery,
      note: input.note.trim() || null,
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return { error: "Failed to update order" };
  }

  if (status === "SHIPPED") {
    // Simulated shipped email (no mail provider is configured in the demo).
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      console.log(`
============================================================
📧 EMAIL SENT [Order Shipped]
To: ${order.email}
Subject: Your AURA Order has Shipped! - ${order.orderNumber}
Carrier: ${order.carrier ?? "-"}  Tracking Number: ${order.trackingNumber ?? "-"}
============================================================
      `);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { success: true };
}

// ── Public: guest tracking by order number + email ──────────────────────────
// Both must match, and the same message is returned for "no such order" and
// "wrong email", so order numbers can't be used to probe for customers.
export async function lookupOrderAction(
  orderNumber: string,
  email: string,
): Promise<{ order: TrackedOrder } | { error: string }> {
  const number = orderNumber.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  const notFound = { error: "We couldn't find an order matching those details." };
  if (!number || !mail) return notFound;

  const order = await prisma.order.findUnique({
    where: { orderNumber: number },
    include: trackedOrderInclude,
  });
  if (!order || order.email.trim().toLowerCase() !== mail) return notFound;

  return { order: toTrackedOrder(order) };
}
