import Image from "next/image";
import Link from "next/link";

export function DealBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] min-h-[260px]">
      {/* Left — fashion image */}
      <Image
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
        alt="Seasonal deals"
        width={900}
        height={500}
        className="absolute inset-y-0 left-0 h-full w-1/2 object-cover object-top"
      />
      {/* Fade from image to dark right side */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a1a2e]/60 to-[#1a1a2e]" />

      {/* Right — text content */}
      <div className="relative flex flex-col items-end gap-5 px-8 py-16 text-right md:px-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e6186c]">
          Limited Time Offer
        </p>
        <h2 className="max-w-sm text-3xl font-bold text-white md:text-4xl leading-tight">
          Up to <span className="text-[#e6186c]">50% Off</span> New Arrivals
        </h2>
        <p className="max-w-xs text-sm text-white/60 leading-relaxed">
          Shop our biggest sale of the season — premium quality pieces at unbeatable prices. Today only.
        </p>
        <div className="flex gap-3">
          <Link
            href="/category/women"
            className="rounded-sm bg-[#e6186c] px-7 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#c91561] active:scale-95"
          >
            Shop Women
          </Link>
          <Link
            href="/category/men"
            className="rounded-sm border border-white/30 px-7 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-neutral-900"
          >
            Shop Men
          </Link>
        </div>
      </div>
    </section>
  );
}
