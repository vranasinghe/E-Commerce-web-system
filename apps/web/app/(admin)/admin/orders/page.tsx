import { Fragment } from "react";
import { prisma } from "@repo/database";
import { AdminStatusForm } from "@/components/orders/AdminStatusForm";
import { STATUS_COLORS, STATUS_LABEL } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">{orders.length} orders</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-400 dark:text-gray-500">
            <tr>
              <th className="px-5 py-2 font-medium">Order</th>
              <th className="px-5 py-2 font-medium">Date</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 font-medium">Items</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-t border-neutral-100 dark:border-gray-800">
                  <td className="px-5 py-3 font-medium text-neutral-900 dark:text-gray-100">{o.orderNumber}</td>
                  <td className="px-5 py-3 text-neutral-600 dark:text-gray-300">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-neutral-600 dark:text-gray-300">{o.email}</td>
                  <td className="px-5 py-3 text-neutral-600 dark:text-gray-300">{o.items.length}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_COLORS[o.status] ?? "bg-neutral-100"
                      }`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">{money(Number(o.total))}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="bg-neutral-50 px-5 py-2 dark:bg-gray-950/40">
                    <AdminStatusForm
                      orderId={o.id}
                      status={o.status}
                      carrier={o.carrier}
                      trackingNumber={o.trackingNumber}
                      estimatedDelivery={o.estimatedDelivery?.toISOString().slice(0, 10) ?? null}
                    />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
