import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { prisma } from "@repo/database";
import { formatPrice, toNumber } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { STATUS_COLORS, STATUS_LABEL, TRACK_STEPS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="mt-12 text-center font-medium text-red-600">
        Please sign in to see your orders.
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const active = orders.filter((o) =>
    ["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(o.status),
  ).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">My orders</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Signed in as {session.email}
        {orders.length > 0 &&
          ` · ${orders.length} order${orders.length === 1 ? "" : "s"}, ${active} in progress`}
      </p>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-neutral-200 py-16 text-center text-neutral-500">
          <Package className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/" className="underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => {
            const exception = o.status === "CANCELLED" || o.status === "RETURNED";
            const stepIdx = TRACK_STEPS.indexOf(o.status);
            const latest = o.events[0];
            const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
            const href = `/account/orders/${o.orderNumber}`;
            return (
              <li key={o.id}>
                <Link
                  href={href}
                  className="block rounded-xl border border-neutral-200 p-4 transition hover:border-neutral-400"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-sm text-neutral-500">
                        Placed {fmtDate(o.createdAt)} · {itemCount} item
                        {itemCount === 1 ? "" : "s"} · {formatPrice(toNumber(o.total))}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[o.status] ?? "bg-neutral-100"
                      }`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>

                  {!exception && stepIdx >= 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-1" aria-hidden="true">
                      {TRACK_STEPS.map((step, i) => (
                        <span
                          key={step}
                          className={`h-1.5 rounded-full ${
                            i <= stepIdx ? "bg-green-600" : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <p className="mt-3 truncate text-sm text-neutral-600">
                    {o.items.map((i) => `${i.name} (${i.size})`).join(", ")}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-neutral-500">
                      {latest
                        ? `Last update ${fmtDate(latest.createdAt)}${
                            latest.note ? `: ${latest.note}` : ""
                          }`
                        : null}
                      {o.trackingNumber && (
                        <>
                          {latest ? " · " : ""}
                          {o.carrier ? `${o.carrier} ` : ""}
                          <span className="font-mono">{o.trackingNumber}</span>
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-medium">
                      Track order <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
