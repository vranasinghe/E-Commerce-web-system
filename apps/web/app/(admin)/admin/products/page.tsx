import Image from "next/image";
import { prisma } from "@repo/database";
import { AddProductDropdown } from "@/components/AddProductDropdown";
import { ProductActions } from "@/components/ProductActions";

export const dynamic = "force-dynamic";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="font-sans transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Products</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{products.length} products total</p>
        </div>
        <AddProductDropdown />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Variants</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                  No products found. Start by adding one.
                </td>
              </tr>
            ) : null}
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-pink-50/30 dark:hover:bg-pink-500/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">?</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{p.category.name}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{p.variants.length}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{stock}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800 dark:text-gray-200">{money(Number(p.basePrice))}</td>
                  <td className="px-5 py-3 text-right">
                    <ProductActions productId={p.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
