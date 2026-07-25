import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string; color?: string; maxPrice?: string };
}) {
  const { category, products } = await getProductsByCategory(params.slug, {
    sort: searchParams.sort,
    color: searchParams.color,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  });

  if (!category) notFound();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">Category</p>
          <h1 className="text-3xl font-semibold">{category.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Sort (filters via query params — server rendered) */}
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={`/category/${category.slug}?sort=${s.value}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                searchParams.sort === s.value ||
                (!searchParams.sort && s.value === "new")
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
