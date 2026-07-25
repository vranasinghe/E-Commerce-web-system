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

  updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      // Cast: status is validated by the route against the OrderStatus enum.
      data: { status: status as never },
    });
  },
};
