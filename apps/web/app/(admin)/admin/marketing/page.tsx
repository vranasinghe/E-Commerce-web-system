import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Marketing</h1>
          <p className="mt-1 text-sm text-neutral-500">Coupons &amp; banners</p>
        </div>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white border-0 cursor-pointer">
          Create coupon
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-400">
            <tr>
              <th className="px-5 py-2 font-medium">Code</th>
              <th className="px-5 py-2 font-medium">Description</th>
              <th className="px-5 py-2 font-medium">Discount</th>
              <th className="px-5 py-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-5 py-3 text-neutral-600">{c.description ?? "—"}</td>
                <td className="px-5 py-3 text-neutral-600">
                  {c.percentOff ? `${c.percentOff}%` : c.amountOff ? `$${c.amountOff}` : "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.active ? "bg-green-100 text-green-700" : "bg-neutral-100"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">No coupons yet.</p>
        )}
      </div>
    </div>
  );
}
