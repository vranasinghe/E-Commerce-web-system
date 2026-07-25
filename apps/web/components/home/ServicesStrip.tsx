import {
  Truck,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Ticket,
  PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVICES: { icon: LucideIcon; label: string }[] = [
  { icon: PackageCheck, label: "Track Your Package" },
  { icon: Headphones, label: "24/7 Customer Support" },
  { icon: Truck, label: "Free Shipping Worldwide" },
  { icon: RotateCcw, label: "Easy Return Policy" },
  { icon: Ticket, label: "Weekend Discount Coupon" },
  { icon: ShieldCheck, label: "Secure Payment Methods" },
];

export function ServicesStrip() {
  // Duplicate the list so the marquee can loop seamlessly.
  const items = [...SERVICES, ...SERVICES];
  return (
    <section className="marquee-pause overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 py-8">
      <div className="flex w-max animate-marquee items-center gap-12 px-6">
        {items.map((s, i) => (
          <div key={i} className="flex w-52 shrink-0 flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#e6186c] shadow-sm">
              <s.icon className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <p className="text-sm font-medium text-neutral-700">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
