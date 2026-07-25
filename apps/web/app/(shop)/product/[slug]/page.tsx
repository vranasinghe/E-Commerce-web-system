import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { RecommendationCarousel } from "@/components/ai/RecommendationCarousel";
import { getProductBySlug, getNewArrivals } from "@/lib/queries";
import { formatPrice, toNumber } from "@/lib/format";
import { ProductTabs } from "@/components/product/ProductTabs";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  // Original / sale price logic
  const basePrice = toNumber(product.basePrice);
  // Simulate an original price (20% above base) for display purposes if product has a sale badge
  const originalPrice = basePrice * 1.2;

  let fitSummary = null;
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4100";
    const res = await fetch(`${AI_SERVICE_URL}/api/reviews/summary/${product.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      fitSummary = await res.json();
    }
  } catch {
    /* ignore */
  }

  // Related products — same category, excluding this one
  const allProducts = await getNewArrivals();
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category?.id === product.category.id)
    .slice(0, 3);

  return (
    <div className="py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-pink-500 transition-colors">Home</Link>
        <span>/</span>
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-pink-500 transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Main product grid */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} alt={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          {/* Product name */}
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h1>

          {/* Price row */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-lg font-bold text-[#e6186c]">
              {formatPrice(basePrice)}
            </span>
          </div>

          {/* Stars + reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(avgRating ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <Link
              href="#reviews-tab"
              className="text-xs text-[#e6186c] underline hover:text-pink-700"
            >
              {product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""}
            </Link>
            {fitSummary && fitSummary.summary !== "No reviews yet" && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                ✨ {fitSummary.summary}
              </span>
            )}
          </div>

          {/* AddToCart (contains Vendor, Availability, Type, Color, Size, Qty, Buttons) */}
          <AddToCart
            productId={product.id}
            slug={product.slug}
            name={product.name}
            image={product.images[0] ?? ""}
            variants={product.variants.map((v) => ({ ...v, price: toNumber(v.price) }))}
            vendor={product.brand}
            category={product.category.name}
          />
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="mt-14">
        <ProductTabs
          description={product.description}
          reviews={product.reviews}
          fitSummary={fitSummary}
          avgRating={avgRating}
        />
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#e6186c] mb-1">
              Our Shop
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {related.map((p) => {
              const img = p.images[0] ?? "https://picsum.photos/seed/placeholder/800/1000";
              const price = toNumber(p.basePrice);
              const origPrice = price * 1.2;
              return (
                <div key={p.id} className="group text-center">
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 mb-3">
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        sizes="33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#e6186c] px-2 py-1 text-[10px] font-bold uppercase text-white">
                        Sale
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#e6186c] transition-colors line-clamp-1">
                      {p.name}
                    </p>
                  </Link>
                  {/* Stars */}
                  <div className="mt-1 flex justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  {/* Prices */}
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(origPrice)}
                    </span>
                    <span className="text-sm font-semibold text-[#e6186c]">
                      {formatPrice(price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* AI recommendations */}
      <RecommendationCarousel productId={product.id} />
    </div>
  );
}
