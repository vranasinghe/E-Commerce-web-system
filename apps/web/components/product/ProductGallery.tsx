"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const safe = images.length ? images : ["/images/products/placeholder.svg"];
  const [active, setActive] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);

  const VISIBLE_THUMBS = 4;
  const canScrollUp = thumbStart > 0;
  const canScrollDown = thumbStart + VISIBLE_THUMBS < safe.length;

  function scrollUp() {
    setThumbStart((s) => Math.max(0, s - 1));
  }

  function scrollDown() {
    setThumbStart((s) =>
      Math.min(safe.length - VISIBLE_THUMBS, s + 1)
    );
  }

  const visibleThumbs = safe.slice(thumbStart, thumbStart + VISIBLE_THUMBS);

  return (
    <div className="flex gap-3 w-full" style={{ height: "520px" }}>
      {/* Left: vertical thumbnail strip */}
      <div className="flex flex-col items-center gap-2 w-[120px] flex-shrink-0">
        {/* Scroll up button */}
        <button
          onClick={scrollUp}
          disabled={!canScrollUp}
          aria-label="Scroll thumbnails up"
          className={`flex h-7 w-full items-center justify-center rounded border transition ${
            canScrollUp
              ? "border-gray-300 hover:bg-gray-100 text-gray-600"
              : "border-transparent text-gray-300 cursor-default"
          }`}
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        {/* Thumbnails */}
        <div className="flex flex-col gap-2 flex-1 w-full overflow-hidden">
          {visibleThumbs.map((src, i) => {
            const realIndex = thumbStart + i;
            const thumbSrc = src || "/images/products/placeholder.svg";
            return (
              <button
                key={thumbSrc + realIndex}
                onClick={() => setActive(realIndex)}
                className={`relative w-full rounded-md overflow-hidden border-2 transition flex-1 ${
                  realIndex === active
                    ? "border-gray-800 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${alt} thumbnail ${realIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
              </button>
            );
          })}
        </div>

        {/* Scroll down button */}
        <button
          onClick={scrollDown}
          disabled={!canScrollDown}
          aria-label="Scroll thumbnails down"
          className={`flex h-7 w-full items-center justify-center rounded border transition ${
            canScrollDown
              ? "border-gray-300 hover:bg-gray-100 text-gray-600"
              : "border-transparent text-gray-300 cursor-default"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Right: large main image */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-50">
        <Image
          src={safe[active] ?? "/images/products/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
