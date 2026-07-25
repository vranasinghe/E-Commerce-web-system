import { prisma } from "@repo/database";

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
      <p className="mt-1 text-sm text-neutral-500">{orders.length} orders</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-400">
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
              <tr key={o.id} className="border-t border-neutral-100">
                <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-5 py-3 text-neutral-600">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-neutral-600">{o.email}</td>
                <td className="px-5 py-3 text-neutral-600">{o.items.length}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">{money(Number(o.total))}</td>
              </tr>
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
