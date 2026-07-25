"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

const ACCENT = "#e6186c";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-white">{children}</h3>
      <span className="mt-2 block h-[3px] w-10" style={{ background: ACCENT }} />
    </div>
  );
}

const QUICK_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Shop Now!", href: "/" },
  { label: "Woman's", href: "/category/women" },
  { label: "FAQ's", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Customer Services", href: "#" },
];

const SUPPORT_LINKS = [
  { label: "My Account", href: "/account/orders" },
  { label: "Checkout", href: "/checkout" },
  { label: "Cart", href: "/cart" },
  { label: "FAQ's", href: "#" },
  { label: "Order Tracking", href: "/account/orders" },
  { label: "Help & Support", href: "#" },
];

const SOCIALS = [
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "Twitter" },
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
];

// Pinterest isn't in lucide — inline the mark so the row matches the reference.
function Pinterest() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.5 2 3.5 5.72 3.5 9.62c0 1.82 1.02 4.08 2.65 4.8.25.11.38.06.44-.18.05-.18.28-1.13.38-1.56a.4.4 0 0 0-.1-.4c-.6-.73-1.08-2.07-1.08-3.32 0-3.2 2.42-6.3 6.55-6.3 3.57 0 6.07 2.43 6.07 5.9 0 3.93-1.98 6.65-4.56 6.65-1.43 0-2.5-1.18-2.15-2.63.41-1.73 1.2-3.6 1.2-4.85 0-1.12-.6-2.05-1.84-2.05-1.46 0-2.63 1.51-2.63 3.53 0 1.29.43 2.16.43 2.16l-1.74 7.36c-.51 2.19-.08 4.87-.04 5.14.02.16.23.2.32.08.13-.17 1.8-2.23 2.37-4.29.16-.58.92-3.6.92-3.6.45.86 1.78 1.62 3.19 1.62 4.2 0 7.05-3.83 7.05-8.95C20.5 5.57 17.2 2 12.04 2Z" />
    </svg>
  );
}

const PAYMENTS = [
  { label: "VISA", color: "#1a1f71", style: "italic font-black" },
  { label: "MC", color: "#eb001b", style: "font-black" },
  { label: "amex", color: "#2e77bc", style: "font-bold lowercase" },
  { label: "Visa", color: "#f7b600", style: "italic font-bold" },
  { label: "AE", color: "#016fd0", style: "font-bold" },
];

export function Footer() {
  function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // Newsletter signup is a UI demo for now.
  }

  return (
    <footer className="mt-24 bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* About The Store */}
        <div>
          <Heading>About The Store</Heading>
          <p className="text-sm font-semibold leading-relaxed text-neutral-200">
            One of the most popular on the web is shopping.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
              Wonder Street, USA, New York
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
              +01 321 654 214
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
              hello@aura.com
            </li>
          </ul>
          <div className="mt-6 flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-md text-white transition hover:opacity-80"
                style={{ background: ACCENT }}
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
            <a
              href="#"
              aria-label="Pinterest"
              className="flex h-8 w-8 items-center justify-center rounded-md text-white transition hover:opacity-80"
              style={{ background: ACCENT }}
            >
              <Pinterest />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <Heading>Quick Links</Heading>
          <ul className="space-y-4 text-sm text-neutral-300">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <Heading>Customer Support</Heading>
          <ul className="space-y-4 text-sm text-neutral-300">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <Heading>Newsletter</Heading>
          <p className="text-sm leading-relaxed text-neutral-300">
            To get the latest news and latest updates from us.
          </p>
          <form onSubmit={onSubscribe} className="mt-5">
            <label className="block text-sm font-semibold text-white">
              Your E-mail Address:
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="mt-3 w-full rounded-md border border-neutral-700 bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-md py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: ACCENT }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-6 text-sm text-neutral-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} AURA is Proudly Owned by{" "}
            <span className="font-bold text-white">AURA Store</span>
          </p>
          <div className="flex items-center gap-2">
            {PAYMENTS.map((p, i) => (
              <span
                key={i}
                className={`flex h-7 w-11 items-center justify-center rounded bg-white text-[11px] ${p.style}`}
                style={{ color: p.color }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}

function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-md text-white shadow-lg transition hover:opacity-90"
      style={{ background: ACCENT }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
