"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface Slide {
  eyebrow: string;
  title: string;
  description: string;
  /** Photo used on the right side */
  image: string;
  /** Solid background colour — should roughly match the photo's studio BG */
  bg: string;
  alt: string;
  variant: "framed" | "natural";
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Autumn Edit",
    title: "Sharper Every Day",
    description:
      "From weekday staples to statement layers — refresh your wardrobe with the season's best.",
    image: "https://res.cloudinary.com/dl2bc5pwj/image/upload/ecommerce/images/hero/reference-editorial.webp",
    bg: "#a8ada6",
    alt: "Brunette model wearing a black camisole and blue jeans beside a wooden stool",
    variant: "framed",
  },
  {
    eyebrow: "Women's Collection",
    title: "Elegance Meets Everyday",
    description:
      "Easy linen, soft textures, and effortless pieces for wherever the day takes you.",
    image: "https://res.cloudinary.com/dl2bc5pwj/image/upload/ecommerce/images/hero/natural-women.webp",
    bg: "#f0e8dc",
    alt: "Blonde model wearing a white linen shirt and beige trousers in a sunlit stone courtyard",
    variant: "natural",
  },
  {
    eyebrow: "Men's Collection",
    title: "Made for Your Everyday",
    description:
      "Refined layers and timeless essentials, styled for the city and beyond.",
    image: "https://res.cloudinary.com/dl2bc5pwj/image/upload/ecommerce/images/hero/natural-men.webp",
    bg: "#e0cbb4",
    alt: "Male model in a camel wool overcoat walking along a warm stone city street",
    variant: "natural",
  },
];

const INTERVAL = 7000;

/** A single full-hero panel: background + right photo + left text frame. */
function Panel({ slide, animateText }: { slide: Slide; animateText: boolean }) {
  return (
    <div className={`hero-panel hero-panel-${slide.variant}`} style={{ background: slide.bg }}>
      <div className="hero-photo-wrap">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          priority
          sizes="100vw"
          className="hero-photo-img"
        />
      </div>

      <div className="hero-text-area">
        <div className={`hero-box${animateText ? " hero-anim" : ""}`}>
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1 className="hero-title">{slide.title}</h1>
          <p className="hero-desc">{slide.description}</p>
          <div className="hero-btns">
            <Link href="/category/women" tabIndex={animateText ? 0 : -1} className="hero-btn-white">
              SHOP WOMEN&apos;S
            </Link>
            <Link href="/category/men" tabIndex={animateText ? 0 : -1} className="hero-btn-ghost">
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
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
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

  // Autoplay moves left to the next slide, wrapping to the first slide.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (rootRef.current?.matches(":hover, :focus-within")) return;
      if (animating.current) return;
      animating.current = true;
      setDir(1);
      setPrev(index);
      setIndex((index + 1) % SLIDES.length);
      setAnimKey((k) => k + 1);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [index, paused]);

  // When the incoming panel finishes its slide, drop the outgoing one.
  const onEnterEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return; // ignore inner text animations
    animating.current = false;
    setPrev(null);
  };

  const slide = SLIDES[index] ?? SLIDES[0]!;

  return (
    <>
      <section ref={rootRef} className="hero-root" aria-label="Seasonal collections" aria-roledescription="carousel">
        {/* Outgoing slide (pushes out) */}
        {prev !== null && (
          <div
            key={`exit-${animKey}`}
            className="hero-layer hero-exit"
            data-dir={dir}
            aria-hidden="true"
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
              aria-current={i === index ? "true" : undefined}
              className={`hero-dot${i === index ? " hero-dot-on" : ""}`}
            />
          ))}
        </div>
        <button
          className="hero-playback"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </section>

      <style jsx global>{`
        /* ── Root container ─────────────────────────────── */
        .hero-root {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          min-height: 520px;
          max-height: 780px;
          overflow: hidden;
          background: #000;
        }

        /* ── Sliding layers (horizontal push transition) ── */
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
          animation: heroEnterFromRight 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-enter[data-dir="-1"] {
          animation: heroEnterFromLeft 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-exit[data-dir="1"] {
          animation: heroExitToLeft 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        .hero-exit { pointer-events: none; }
        .hero-exit[data-dir="-1"] {
          animation: heroExitToRight 0.7s cubic-bezier(0.65, 0, 0.35, 1) both;
        }
        @keyframes heroEnterFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes heroExitToLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes heroEnterFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes heroExitToRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
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
        .hero-panel-natural .hero-photo-wrap { width: 100%; }
        .hero-panel-natural .hero-photo-img { object-position: right center; }

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
          width: min(500px, 49vw);
          border: 2px solid rgba(255, 255, 255, 0.85);
          padding: clamp(24px, 3vw, 40px);
          background: rgba(20, 26, 22, 0.48);
        }
        .hero-panel-natural .hero-box {
          width: min(500px, 43vw);
          border: none;
          background: rgba(248, 244, 235, 0.9);
        }
        .hero-panel-natural .hero-title { color: #20251f; }
        .hero-panel-natural .hero-eyebrow,
        .hero-panel-natural .hero-desc { color: #3d433b; }
        .hero-panel-natural .hero-btn-white { background: #20251f; color: #fff; border-color: #20251f; }
        .hero-panel-natural .hero-btn-ghost { color: #20251f; border-color: #20251f; background: transparent; }
        .hero-panel-natural .hero-btn-white:hover { background: #394133; border-color: #394133; }
        .hero-panel-natural .hero-btn-ghost:hover { background: #20251f; color: #fff; }

        .hero-eyebrow {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.95);
          letter-spacing: 0.03em;
          margin: 0 0 8px;
        }
        .hero-title {
          font-size: clamp(30px, 3.5vw, 48px);
          font-weight: 700;
          line-height: 1.15;
          color: #ffffff;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .hero-desc {
          font-size: 16px;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 12px 20px;
          font-size: 12px;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 12px 20px;
          font-size: 12px;
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
          width: 44px;
          height: 44px;
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
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 2px;
        }
        .hero-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .hero-dot::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          opacity: 0.6;
          transition: width 0.25s, border-radius 0.25s;
        }
        .hero-dot-on::after {
          width: 22px;
          border-radius: 4px;
          opacity: 1;
        }
        .hero-playback {
          position: absolute;
          right: 12px;
          bottom: 4px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          color: #20251f;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          cursor: pointer;
        }
        .hero-root button:focus-visible,
        .hero-root a:focus-visible {
          outline: 3px solid #fff;
          outline-offset: 4px;
          box-shadow: 0 0 0 6px #20251f;
        }
        @media (max-width: 767px) {
          .hero-root { aspect-ratio: auto; height: clamp(700px, 100svh, 780px); min-height: 0; }
          .hero-photo-wrap,
          .hero-panel-natural .hero-photo-wrap { width: 100%; height: 51%; }
          .hero-photo-img { object-position: 72% top; }
          .hero-panel-natural .hero-photo-img { object-position: 82% center; }
          .hero-text-area { top: 51%; align-items: center; padding: 12px 20px 48px; }
          .hero-box,
          .hero-panel-natural .hero-box { width: 100%; padding: 20px; }
          .hero-panel-natural .hero-box { padding: 0; background: transparent; }
          .hero-title { font-size: clamp(28px, 7vw, 38px); }
          .hero-desc { font-size: 15px; margin-bottom: 18px; line-height: 1.5; }
          .hero-eyebrow { font-size: 13px; }
          .hero-btns { flex-wrap: nowrap; gap: 8px; }
          .hero-btn-white,
          .hero-btn-ghost { flex: 1; padding: 10px 8px; font-size: 10px; letter-spacing: 0.03em; }
          .hero-arr { top: 25.5%; }
          .hero-arr-l { left: 8px; }
          .hero-arr-r { right: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-enter,
          .hero-exit {
            animation-duration: 0.001s !important;
          }
          .hero-anim > * { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}
