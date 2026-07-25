import Link from "next/link";
import Image from "next/image";
import { Users, Award, Globe, Heart } from "lucide-react";

export const metadata = {
  title: "About Us | AURA",
  description: "Learn about AURA — our story, our values, and the people behind the brand.",
};

const STATS = [
  { label: "Happy Customers", value: "50,000+", icon: Users },
  { label: "Countries Served", value: "30+",    icon: Globe  },
  { label: "Awards Won",       value: "12",      icon: Award  },
  { label: "Products Loved",   value: "2,000+",  icon: Heart  },
];

const TEAM = [
  { name: "Sofia Ahmed",     role: "Founder & CEO",        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
  { name: "James Carter",    role: "Head of Design",        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { name: "Priya Sharma",    role: "Creative Director",     image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
  { name: "Marcus Lee",      role: "Head of Operations",    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-28 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-rose-500 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-3">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            About AURA
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            We believe fashion is a form of self-expression. AURA was born from a passion for
            creating clothing that empowers every individual to feel confident, beautiful, and authentic.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5">
              Crafted with Purpose, <span className="text-pink-600">Worn with Pride</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2020, AURA set out to disrupt the fashion industry with clothing that doesn&apos;t
              compromise on quality, ethics, or style. Every piece in our collection is thoughtfully
              designed and responsibly sourced.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our team of passionate designers works year-round to bring you collections that are ahead
              of the curve while remaining timeless. We believe every wardrobe should feel personal — and
              we&apos;re here to help you build yours.
            </p>
            <Link
              href="/collection"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-8 py-3 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-200"
            >
              Explore Collection
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-square shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
              alt="AURA brand story"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-6 h-6 text-pink-500" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Meet the Team</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            The creative minds and passionate people who make AURA possible.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-gray-900">{member.name}</h3>
              <p className="text-sm text-pink-500 mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-600 py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Find Your Style?</h2>
        <p className="text-pink-100 mb-8 max-w-md mx-auto">
          Browse our latest collections and discover pieces made for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/collection"
            className="bg-white text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 transition-colors shadow"
          >
            Shop Collections
          </Link>
          <Link
            href="/contact"
            className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
