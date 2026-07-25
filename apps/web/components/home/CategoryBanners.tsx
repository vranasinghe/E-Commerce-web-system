import Image from "next/image";
import Link from "next/link";

interface Banner {
  label: string;
  sub: string;
  href: string;
  image: string;
}

const TALL: Banner = {
  label: "New Collections",
  sub: "Women's Styles",
  href: "/category/women",
  image:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
};

const SMALL: Banner[] = [
  {
    label: "Popular Picks",
    sub: "Tops & Blouses",
    href: "/category/tops",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
  },
  {
    label: "Hot Trending",
    sub: "Summer Dresses",
    href: "/category/dresses",
    image:
      "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&w=700&q=80",
  },
];

const WIDE: Banner = {
  label: "Winter Collections",
  sub: "Men's Outerwear",
  href: "/category/outerwear",
  image:
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=80",
};

function Tile({ banner, className }: { banner: Banner; className?: string }) {
  return (
    <Link
      href={banner.href}
      className={`group relative overflow-hidden rounded-2xl bg-neutral-100 ${className ?? ""}`}
    >
      <Image
        src={banner.image}
        alt={banner.label}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-5 left-5">
        <p className="text-xs font-medium uppercase tracking-widest text-white/70 mb-0.5">
          {banner.sub}
        </p>
        <span className="text-lg font-bold italic text-white drop-shadow">
          {banner.label}
        </span>
      </div>
    </Link>
  );
}

export function CategoryBanners() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Tile banner={TALL} className="min-h-[20rem] md:row-span-2" />
      <div className="grid grid-cols-2 gap-4">
        {SMALL.map((b) => (
          <Tile key={b.label} banner={b} className="min-h-[9.5rem]" />
        ))}
      </div>
      <Tile banner={WIDE} className="min-h-[9.5rem]" />
    </section>
  );
}
