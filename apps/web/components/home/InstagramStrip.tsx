import Image from "next/image";
import { Instagram } from "lucide-react";

// Curated real-world fashion Instagram-style shots
const SHOTS = [
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=75",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=75",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=75",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=75",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=400&q=75",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=75",
];

export function InstagramStrip() {
  return (
    <section>
      <div className="text-center mb-5">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-600">
          <Instagram className="h-4 w-4 text-[#e6186c]" />
          Follow us on Instagram{" "}
          <span className="font-bold text-[#e6186c]">@aura.store</span>
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6">
        {SHOTS.map((src, i) => (
          <a
            key={i}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden bg-neutral-100"
          >
            <Image
              src={src}
              alt={`AURA Instagram look ${i + 1}`}
              fill
              sizes="(max-width: 768px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-[#e6186c]/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-white mb-1" />
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Shop Look</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
