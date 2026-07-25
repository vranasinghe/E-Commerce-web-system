import Link from "next/link";
import Image from "next/image";
import { Clock, User, Tag } from "lucide-react";

export const metadata = {
  title: "Blog | AURA",
  description: "Fashion insights, style guides, and brand stories from the AURA team.",
};

const POSTS = [
  {
    id: 1,
    title: "10 Timeless Wardrobe Essentials Every Woman Needs",
    excerpt:
      "Building a capsule wardrobe isn't about having everything — it's about having the right things. We break down the 10 pieces that will serve you for years.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    category: "Style Guide",
    author: "Sofia Ahmed",
    date: "July 18, 2026",
    readTime: "5 min read",
    slug: "wardrobe-essentials",
  },
  {
    id: 2,
    title: "Men's Fashion Trends to Watch This Season",
    excerpt:
      "From oversized blazers to relaxed tailoring, men's fashion is embracing comfort without sacrificing style. Here's what's trending right now.",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80",
    category: "Trends",
    author: "Marcus Lee",
    date: "July 12, 2026",
    readTime: "4 min read",
    slug: "mens-trends",
  },
  {
    id: 3,
    title: "How to Style Dresses for Every Occasion",
    excerpt:
      "Whether it's a casual brunch or a formal dinner, a dress can do it all. Learn how to style the same dress differently for multiple occasions.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    category: "Style Guide",
    author: "Priya Sharma",
    date: "July 5, 2026",
    readTime: "6 min read",
    slug: "style-dresses",
  },
  {
    id: 4,
    title: "Sustainable Fashion: What It Means & Why It Matters",
    excerpt:
      "The fashion industry is one of the biggest polluters in the world. At AURA, we're committed to changing that. Learn about our sustainability journey.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "Brand Story",
    author: "Sofia Ahmed",
    date: "June 28, 2026",
    readTime: "7 min read",
    slug: "sustainable-fashion",
  },
  {
    id: 5,
    title: "Kids' Fashion: Fun, Comfortable, and Durable",
    excerpt:
      "Dressing kids should be fun — for them and for you. We've curated the best kids' picks that balance playfulness with practicality.",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80",
    category: "Kids",
    author: "James Carter",
    date: "June 20, 2026",
    readTime: "3 min read",
    slug: "kids-fashion",
  },
  {
    id: 6,
    title: "The Art of Layering: A Complete Guide",
    excerpt:
      "Layering is a skill. Done right, it adds depth, warmth, and personality to any outfit. Our style team shares their top layering secrets.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
    category: "Style Guide",
    author: "Priya Sharma",
    date: "June 10, 2026",
    readTime: "5 min read",
    slug: "art-of-layering",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Style Guide": "bg-pink-50 text-pink-600",
  "Trends":      "bg-purple-50 text-purple-600",
  "Brand Story": "bg-rose-50 text-rose-600",
  "Kids":        "bg-amber-50 text-amber-600",
};

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-rose-500 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-3">Insights & Stories</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">The AURA Blog</h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Style guides, trend reports, and behind-the-scenes brand stories — all in one place.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Featured Post */}
        {featured && (
          <div className="mb-16">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-pink-500 rounded-full inline-block" />
              Featured Post
            </h2>
            <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
              <div className="relative aspect-video md:aspect-auto min-h-[260px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex flex-col justify-center bg-white">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start ${CATEGORY_COLORS[featured.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {featured.category}
                </span>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors leading-snug">
                  {featured.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{featured.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-pink-500 rounded-full inline-block" />
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-600 py-16 px-4 text-center mt-8">
        <h2 className="text-2xl font-extrabold text-white mb-3">Stay in the Loop</h2>
        <p className="text-pink-100 mb-6 text-sm max-w-sm mx-auto">
          Get our latest style tips and new arrivals delivered straight to your inbox.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-full px-5 py-2.5 text-sm text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-white text-pink-600 font-bold px-6 py-2.5 rounded-full hover:bg-pink-50 transition-colors text-sm"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
