import { getFeaturedProducts, getNewArrivals } from "@/lib/queries";
import { toNumber } from "@/lib/format";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { DealBanner } from "@/components/home/DealBanner";
import { ServicesStrip } from "@/components/home/ServicesStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { SectionHeading } from "@/components/home/SectionHeading";
import { BlogPreview } from "@/components/home/BlogPreview";
import { InstagramStrip } from "@/components/home/InstagramStrip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, arrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  const toCard = (p: Awaited<ReturnType<typeof getNewArrivals>>[number]) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    basePrice: toNumber(p.basePrice),
    images: p.images,
    featured: p.featured,
    category: p.category ? { name: p.category.name } : null,
  });

  const recent = arrivals.slice(0, 6).map(toCard);
  const popular = (featured.length >= 6 ? featured : arrivals).slice(0, 6).map(toCard);
  const bestSelling = [...arrivals].reverse().slice(0, 6).map(toCard);

  return (
    <div className="space-y-20">
      {/* ── Hero: breaks out of the max-w-7xl container ── */}
      <div className="bleed-full">
        <HeroCarousel />
      </div>

      <CategoryBanners />

      {recent.length > 0 && (
        <section>
          <SectionHeading eyebrow="See Our Collection" title="Recent Products" />
          <ProductShowcase products={recent} />
        </section>
      )}

      <DealBanner />

      {popular.length > 0 && (
        <section>
          <SectionHeading eyebrow="See Our Collection" title="Popular Products" />
          <ProductShowcase products={popular} />
        </section>
      )}

      <ServicesStrip />

      {bestSelling.length > 0 && (
        <section>
          <SectionHeading eyebrow="See Our Collection" title="Best Selling Products" />
          <ProductShowcase products={bestSelling} />
        </section>
      )}

      <BlogPreview />

      <InstagramStrip />
    </div>
  );
}
