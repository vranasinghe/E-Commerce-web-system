import { prisma } from "@repo/database";

// The demo site has exactly two shared accounts, opened by the "Try the demo"
// buttons. They have no password, so the login form can never sign in to them,
// and a database trigger (see the protect_demo_accounts migration) refuses any
// change to their email, name, password or role, and any deletion.
export const DEMO_EMAIL_DOMAIN = "demo.aura.test";
export const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

export type DemoRole = "CUSTOMER" | "ADMIN";

export const DEMO_ACCOUNTS: Record<DemoRole, { id: string; email: string; name: string }> = {
  CUSTOMER: {
    id: "demo_account_customer",
    email: `demo.customer@${DEMO_EMAIL_DOMAIN}`,
    name: "Demo Customer",
  },
  ADMIN: {
    id: "demo_account_admin",
    email: `demo.admin@${DEMO_EMAIL_DOMAIN}`,
    name: "Demo Admin",
  },
};

const PROTECTED_EMAILS: string[] = Object.values(DEMO_ACCOUNTS).map((a) => a.email);

export function isProtectedAccountEmail(email: string | null | undefined): boolean {
  return !!email && PROTECTED_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Demo login is ON by default, including on the deployed site. Set
 * DEMO_LOGIN_ENABLED=false to switch it off. Note the demo admin gives anyone
 * full access to the admin panel.
 */
export function isDemoLoginEnabled(): boolean {
  return process.env.DEMO_LOGIN_ENABLED !== "false";
}

/** Returns the fixed demo account for a role, creating it only if it is missing. */
export async function ensureDemoAccount(role: DemoRole) {
  const def = DEMO_ACCOUNTS[role];
  const existing = await prisma.user.findUnique({ where: { email: def.email } });
  if (existing) return existing;
  return prisma.user.create({
    data: { id: def.id, email: def.email, name: def.name, role },
  });
}

/**
 * Housekeeping for demo data older than 24 hours. The two fixed accounts are
 * kept, but their old orders (stock is put back) and chat history are removed.
 * Leftover one-off demo accounts from the earlier temporary-account design are
 * deleted along with all their data. Returns how many such accounts were removed.
 */
export async function purgeExpiredDemoData(): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_TTL_MS);

  const fixed = await prisma.user.findMany({
    where: { email: { in: PROTECTED_EMAILS } },
    select: { id: true },
  });
  const fixedIds = fixed.map((u) => u.id);

  const legacy = await prisma.user.findMany({
    where: {
      email: { endsWith: `@${DEMO_EMAIL_DOMAIN}`, notIn: PROTECTED_EMAILS },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });
  const legacyIds = legacy.map((u) => u.id);

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: { in: legacyIds } },
        { userId: { in: fixedIds }, createdAt: { lt: cutoff } },
      ],
    },
    select: { id: true, items: { select: { variantId: true, quantity: true } } },
  });

  if (orders.length === 0 && legacyIds.length === 0 && fixedIds.length === 0) return 0;

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
    prisma.chatSession.deleteMany({
      where: {
        OR: [
          { userId: { in: legacyIds } },
          { userId: { in: fixedIds }, createdAt: { lt: cutoff } },
        ],
      },
    }),
    // Cascades to addresses, cart, wishlist, reviews and the size profile.
    prisma.user.deleteMany({ where: { id: { in: legacyIds } } }),
  ]);

  return legacyIds.length;
}
