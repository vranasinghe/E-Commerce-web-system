import { prisma } from "@repo/database";

// Demo accounts are created on demand by the "Try the demo" buttons. They are
// recognised by this email domain and everything they own is deleted once the
// account is older than DEMO_TTL_MS.
export const DEMO_EMAIL_DOMAIN = "demo.aura.test";
export const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * The demo admin gives anyone full access to the admin panel, so demo login is
 * on by default in development only. Set DEMO_LOGIN_ENABLED=true to allow it
 * on a deployed demo site, or =false to switch it off.
 */
export function isDemoLoginEnabled(): boolean {
  const flag = process.env.DEMO_LOGIN_ENABLED;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

/**
 * Delete demo accounts older than 24 hours together with their data: orders
 * (stock is put back), addresses, cart, wishlist, reviews, size profile and
 * chat history. Safe to call often; returns how many accounts were removed.
 */
export async function purgeExpiredDemoData(): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_TTL_MS);
  const users = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` }, createdAt: { lt: cutoff } },
    select: { id: true },
  });
  if (users.length === 0) return 0;
  const userIds = users.map((u) => u.id);

  const orders = await prisma.order.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, items: { select: { variantId: true, quantity: true } } },
  });

  await prisma.$transaction([
    // Checkout takes stock off the variant, so give it back.
    ...orders.flatMap((o) =>
      o.items.map((i) =>
        prisma.productVariant.updateMany({
          where: { id: i.variantId },
          data: { stock: { increment: i.quantity } },
        }),
      ),
    ),
    prisma.order.deleteMany({ where: { id: { in: orders.map((o) => o.id) } } }),
    prisma.chatSession.deleteMany({ where: { userId: { in: userIds } } }),
    // Cascades to addresses, cart, wishlist, reviews and the size profile.
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);

  return userIds.length;
}
