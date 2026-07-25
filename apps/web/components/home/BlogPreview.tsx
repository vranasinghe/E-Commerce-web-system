import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

const POSTS = [
  {
    title: "5 ways AI is changing how we shop for clothes",
    date: "July 2, 2026",
    tag: "Technology",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Building a capsule wardrobe that actually works",
    date: "June 24, 2026",
    tag: "Style Guide",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "The colors defining this season's street style",
    date: "June 15, 2026",
    tag: "Trends",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80",
  },
];

export function BlogPreview() {
  return (
    <section>
      <SectionHeading eyebrow="Recent Story" title="From the AURA Blog" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {POSTS.map((post) => (
          <Link key={post.title} href="#" className="group block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Tag badge */}
              <span className="absolute top-3 left-3 bg-[#e6186c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                {post.tag}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-wide text-[#e6186c]">
              {post.date}
            </p>
            <h3 className="mt-1 text-base font-semibold text-neutral-900 group-hover:text-[#e6186c] transition-colors leading-snug">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
