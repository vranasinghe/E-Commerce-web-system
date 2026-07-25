"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  eyebrow: string;
  title: string;
  description: string;
  /** Photo used on the right side */
  image: string;
  /** Solid background colour — should roughly match the photo's studio BG */
  bg: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "New Season — Women's Collection",
    title: "Elegance Meets Everyday",
    description:
      "Discover curated women's styles from flowing dresses to tailored essentials — AI-styled just for you.",
    image: "/Hero page 02.jpg",
    bg: "#dbcebf",
  },
  {
    eyebrow: "Trending Looks",
    title: "New Season Essentials",
    description:
      "Shop pieces picked for the way you live — smart recommendations, worldwide shipping, styled by AI.",
    image: "/Hero page 01.jpg",
    bg: "#d5a4a5",
  },
  {
    eyebrow: "Autumn Edit",
    title: "Sharper Every Day",
    description:
      "From weekday staples to statement layers — refresh your wardrobe with the season's best.",
    image: "/Hero page 03.jpg",
    bg: "#a8ada6",
  },
];

const INTERVAL = 5500;

/** A single full-hero panel: background + right photo + left text frame. */
function Panel({ slide, animateText }: { slide: Slide; animateText: boolean }) {
  return (
    <div className="hero-panel" style={{ background: slide.bg }}>
      <div className="hero-photo-wrap">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          sizes="70vw"
          className="hero-photo-img"
        />
      </div>

      <div className="hero-text-area">
        <div className={`hero-box${animateText ? " hero-anim" : ""}`}>
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-desc">{slide.description}</p>
          <div className="hero-btns">
            <Link href="/category/women" className="hero-btn-white">
              SHOP WOMEN&apos;S
            </Link>
            <Link href="/category/men" className="hero-btn-ghost">
              SHOP MEN&apos;S
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  // The slide currently sliding out (null when idle), plus a bump key + direction.
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);
  const animating = useRef(false);

  const go = useCallback(
    (target: number, direction: 1 | -1) => {
      if (animating.current) return;
      const next = (target + SLIDES.length) % SLIDES.length;
      if (next === index) return;
      animating.current = true;
      setDir(direction);
      setPrev(index);
      setIndex(next);
      setAnimKey((k) => k + 1);
    },
    [index]
  );

  // Autoplay — always pushes upward, wrapping to the first slide.
  useEffect(() => {
    const id = setInterval(() => {
      if (animating.current) return;
      animating.current = true;
      setDir(1);
      setPrev(index);
      setIndex((index + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [index]);

  // When the incoming panel finishes its slide, drop the outgoing one.
  const onEnterEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return; // ignore inner text animations
    animating.current = false;
    setPrev(null);
  };

  const slide = SLIDES[index] ?? SLIDES[0]!;

  return (
    <>
      <section className="hero-root">
        {/* Outgoing slide (pushes out) */}
        {prev !== null && (
          <div
            key={`exit-${animKey}`}
            className="hero-layer hero-exit"
            data-dir={dir}
          >
            <Panel slide={SLIDES[prev] ?? slide} animateText={false} />
          </div>
        )}

        {/* Incoming / current slide */}
        <div
          key={`enter-${animKey}`}
          className={`hero-layer${animKey > 0 ? " hero-enter" : ""}`}
          data-dir={dir}
          onAnimationEnd={onEnterEnd}
        >
          <Panel slide={slide} animateText />
        </div>

        {/* Left arrow */}
        <button
          onClick={() => go(index - 1, -1)}
          aria-label="Previous slide"
          className="hero-arr hero-arr-l"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Right arrow */}
        <button
          onClick={() => go(index + 1, 1)}
          aria-label="Next slide"
          className="hero-arr hero-arr-r"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              onClick={() => go(i, i > index ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-dot${i === index ? " hero-dot-on" : ""}`}
            />
          ))}
        </div>
      </section>

      <style jsx global>{`
        /* ── Root container ─────────────────────────────── */
        .hero-root {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 400px;
          overflow: hidden;
          background: #000;
        }

        /* ── Sliding layers (vertical push transition) ──── */
        .hero-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          will-change: transform;
        }
        .hero-enter {
          z-index: 2;
        }
        .hero-enter[data-dir="1"] {
          animation: heroEnterUp 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-enter[data-dir="-1"] {
          animation: heroEnterDown 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-exit[data-dir="1"] {
          animation: heroExitUp 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-exit[data-dir="-1"] {
          animation: heroExitDown 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        @keyframes heroEnterUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes heroExitUp {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
        @keyframes heroEnterDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes heroExitDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }

        /* ── Panel: fills the hero ──────────────────────── */
        .hero-panel {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        /* Photo occupies the RIGHT portion of the hero */
        .hero-photo-wrap {
          position: absolute;
          top: 0;
          right: 0;
          width: 68%;
          height: 100%;
        }
        .hero-photo-img {
          object-fit: cover;
          object-position: center top;
        }

        /* ── Text area ──────────────────────────────────── */
        .hero-text-area {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          padding-left: clamp(24px, 5vw, 80px);
        }

        /* White-bordered frame — matches reference */
        .hero-box {
          width: min(380px, 48vw);
          border: 2px solid rgba(255, 255, 255, 0.85);
          padding: 28px;
          background: rgba(0, 0, 0, 0.08);
        }
        @media (max-width: 768px) {
          .hero-box {
            width: min(300px, 78vw);
            padding: 20px;
          }
        }

        .hero-eyebrow {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 0.03em;
          margin: 0 0 8px;
        }
        .hero-title {
          font-size: clamp(24px, 3.5vw, 42px);
          font-weight: 700;
          line-height: 1.15;
          color: #ffffff;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .hero-desc {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.65;
          margin: 0 0 22px;
        }

        .hero-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .hero-btn-white {
          display: inline-block;
          padding: 9px 18px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          background: #ffffff;
          color: #1a1a1a;
          border: 1.5px solid #ffffff;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .hero-btn-white:hover {
          background: #e6186c;
          border-color: #e6186c;
          color: #ffffff;
        }
        .hero-btn-ghost {
          display: inline-block;
          padding: 9px 18px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .hero-btn-ghost:hover {
          background: #ffffff;
          color: #1a1a1a;
        }

        /* ── Navigation arrows ──────────────────────────── */
        .hero-arr {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.18s;
        }
        .hero-arr:hover {
          background: #ffffff;
        }
        .hero-arr-l {
          left: 12px;
        }
        .hero-arr-r {
          right: 12px;
        }

        /* ── Dots ───────────────────────────────────────── */
        .hero-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 6px;
        }
        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width 0.25s, background 0.25s, border-radius 0.25s;
        }
        .hero-dot-on {
          width: 22px;
          border-radius: 4px;
          background: #ffffff;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-enter,
          .hero-exit {
            animation-duration: 0.001s !important;
          }
        }
      `}</style>
    </>
  );
}
