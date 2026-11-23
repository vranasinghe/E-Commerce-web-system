import { prisma } from "@repo/database";

// The demo site has exactly two shared accounts, opened by the "Try the demo"
// buttons. Everything they own is wiped every 24 hours (see purgeExpiredDemoData).
// They have no password, so the login form can never sign in to them,
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
 * Housekeeping for demo data. Each fixed demo account is reset on a rolling
 * 24-hour window: once 24 hours have passed since its last reset, everything it
 * owns is deleted (orders, with stock put back, plus addresses, cart, wishlist,
 * reviews, size profile and chat history) and a new window starts. The account
 * itself is kept. The window start is stored in the account's updatedAt, which
 * the protection trigger leaves alone. Leftover one-off demo accounts from the
 * earlier temporary-account design are deleted outright once a day old.
 * Safe to call often; returns how many accounts were reset or removed.
 */
export async function purgeExpiredDemoData(): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_TTL_MS);
  let affected = 0;

  const fixed = await prisma.user.findMany({
    where: { email: { in: PROTECTED_EMAILS }, updatedAt: { lt: cutoff } },
    select: { id: true, updatedAt: true },
  });
  for (const account of fixed) {
    const reset = await prisma.$transaction(async (tx) => {
      // Claim this window so two requests at once don't both wipe the data.
      const claimed = await tx.user.updateMany({
        where: { id: account.id, updatedAt: account.updatedAt },
        data: { updatedAt: new Date() },
      });
      if (claimed.count === 0) return false;
      await wipeUserData(tx, [account.id]);
      return true;
    });
    if (reset) affected += 1;
  }

  const legacy = await prisma.user.findMany({
    where: {
      email: { endsWith: `@${DEMO_EMAIL_DOMAIN}`, notIn: PROTECTED_EMAILS },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });
  if (legacy.length > 0) {
    const ids = legacy.map((u) => u.id);
    await prisma.$transaction(async (tx) => {
      await wipeUserData(tx, ids);
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    });
    affected += legacy.length;
  }

  return affected;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Deletes everything the given users own, keeping the users themselves. */
async function wipeUserData(tx: Tx, userIds: string[]) {
  const orders = await tx.order.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, items: { select: { variantId: true, quantity: true } } },
  });
  // Checkout takes stock off the variant, so give it back.
  for (const o of orders) {
    for (const i of o.items) {
      await tx.productVariant.updateMany({
        where: { id: i.variantId },
        data: { stock: { increment: i.quantity } },
      });
    }
  }
  await tx.order.deleteMany({ where: { id: { in: orders.map((o) => o.id) } } });
  await tx.chatSession.deleteMany({ where: { userId: { in: userIds } } });
  await tx.review.deleteMany({ where: { userId: { in: userIds } } });
  await tx.cart.deleteMany({ where: { userId: { in: userIds } } });
  await tx.wishlist.deleteMany({ where: { userId: { in: userIds } } });
  await tx.userSizeProfile.deleteMany({ where: { userId: { in: userIds } } });
  await tx.address.deleteMany({ where: { userId: { in: userIds } } });
}
