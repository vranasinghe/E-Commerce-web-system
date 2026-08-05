"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safe = images.length ? images : ["/images/products/placeholder.svg"];
  const [active, setActive] = useState(0);

  function prev() {
    setActive((a) => (a - 1 + safe.length) % safe.length);
  }
  function next() {
    setActive((a) => (a + 1) % safe.length);
  }

  // Show up to 3 visible thumbnails in top row
  const thumbs = safe.slice(0, Math.min(safe.length, 3));

  return (
    <div className="space-y-3">
      {/* Main image row — 3 thumbnails side by side with prev/next */}
      <div className="relative flex gap-2">
        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        {/* Show 3 images */}
        <div className="flex flex-1 gap-2 overflow-hidden">
          {thumbs.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative flex-1 overflow-hidden rounded-md border-2 transition ${
                i === active ? "border-pink-500" : "border-transparent"
              }`}
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="33vw"
              />
            </button>
          ))}
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow border border-gray-200 hover:bg-gray-50 transition"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Dot indicators */}
      {safe.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-1">
          {safe.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-pink-500" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
