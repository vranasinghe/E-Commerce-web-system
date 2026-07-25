import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-neutral-500">{customers.length} customers</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-400">
            <tr>
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 text-right font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-5 py-3 font-medium">{c.name ?? "—"}</td>
                <td className="px-5 py-3 text-neutral-600">{c.email}</td>
                <td className="px-5 py-3 text-right">{c._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
