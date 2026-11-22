import { prisma } from "@repo/database";

export const orderService = {
  list(userId?: string) {
    return prisma.order.findMany({
      where: userId ? { userId } : undefined,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  getByNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
  },

  // Updates the order and appends a history entry so tracking stays in sync
  // with status changes made through the API.
  async updateStatus(
    id: string,
    status: string,
    extra: { trackingNumber?: string; carrier?: string; note?: string } = {},
  ) {
    // Cast: status is validated by the route against the OrderStatus enum.
    const typed = status as never;
    const [order] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: typed,
          ...(extra.trackingNumber && { trackingNumber: extra.trackingNumber }),
          ...(extra.carrier && { carrier: extra.carrier }),
        },
      }),
      prisma.orderEvent.create({
        data: { orderId: id, status: typed, note: extra.note ?? null },
      }),
    ]);
    return order;
  },
};
