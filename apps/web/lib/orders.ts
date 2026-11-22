import { prisma, type OrderStatus } from "@repo/database";
import type { TrackedOrder } from "./order-status";

export const trackedOrderInclude = {
  items: true,
  events: { orderBy: { createdAt: "asc" as const } },
};

type OrderWithRelations = NonNullable<
  Awaited<ReturnType<typeof prisma.order.findFirst<{ include: typeof trackedOrderInclude }>>>
>;

export function toTrackedOrder(o: OrderWithRelations): TrackedOrder {
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    total: Number(o.total),
    shipping: Number(o.shipping),
    subtotal: Number(o.subtotal),
    carrier: o.carrier,
    trackingNumber: o.trackingNumber,
    estimatedDelivery: o.estimatedDelivery?.toISOString() ?? null,
    items: o.items.map((i) => ({
      name: i.name,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: Number(i.price),
    })),
    events: o.events.map((e) => ({
      status: e.status,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export interface StatusChange {
  status: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: Date | null;
  note?: string | null;
}

/** Update an order and append a history event in one transaction. */
export function setOrderStatus(orderId: string, change: StatusChange) {
  return prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: change.status,
        ...(change.trackingNumber !== undefined && { trackingNumber: change.trackingNumber }),
        ...(change.carrier !== undefined && { carrier: change.carrier }),
        ...(change.estimatedDelivery !== undefined && {
          estimatedDelivery: change.estimatedDelivery,
        }),
      },
    }),
    prisma.orderEvent.create({
      data: { orderId, status: change.status, note: change.note || null },
    }),
  ]);
}
