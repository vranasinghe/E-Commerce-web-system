import Link from "next/link";
import { prisma } from "@repo/database";
import { formatPrice, toNumber } from "@/lib/format";

import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-neutral-200 text-neutral-700",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="mt-12 text-center text-red-600 font-medium">
        Unauthorized. Please log in to see your orders.
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your orders</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Order history &amp; tracking. (Auth via NextAuth is scaffolded — this view
        currently shows recent demo orders.)
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-neutral-200 py-16 text-center text-neutral-500">
          No orders yet.{" "}
          <Link href="/" className="underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                    {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[o.status] ?? "bg-neutral-100"
                  }`}
                >
                  {o.status}
                </span>
                <span className="font-medium">{formatPrice(toNumber(o.total))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
