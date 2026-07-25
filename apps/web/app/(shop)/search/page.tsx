import { ProductCard } from "@/components/ProductCard";
import { searchProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const products = q ? await searchProducts(q) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {q
          ? `${products.length} product${products.length === 1 ? "" : "s"} found`
          : "Type a query in the search bar above."}
      </p>

      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {q && products.length === 0 && (
        <p className="mt-16 text-center text-neutral-500">
          No matches. Try a different term — or use{" "}
          <a href="/visual-search" className="underline">visual search</a>.
        </p>
      )}
    </div>
  );
}
