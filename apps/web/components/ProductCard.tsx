import Image from "next/image";
import Link from "next/link";
import { formatPrice, toNumber } from "@/lib/format";
import { QuickAdd, type QuickAddVariant } from "@/components/product/QuickAdd";

export interface ProductCardData {
  id?: string;
  slug: string;
  name: string;
  brand: string | null;
  basePrice: unknown;
  images: string[];
  category?: { name: string } | null;
  variants?: QuickAddVariant[];
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0] ?? "https://res.cloudinary.com/dl2bc5pwj/image/upload/ecommerce/images/products/placeholder__svg.svg";
  const href = `/product/${product.slug}`;
  // Plain numbers only: this data crosses into a client component.
  const variants = product.variants?.map((v) => ({ ...v, price: toNumber(v.price) }));

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
        {/* The whole image is the link; Quick Add sits above it. */}
        <Link href={href} aria-label={product.name} className="absolute inset-0 z-0">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <QuickAdd
          product={{ id: product.id, slug: product.slug, name: product.name, image, variants }}
        />
      </div>
      <Link href={href} className="mt-3 block space-y-0.5">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            {product.brand}
          </p>
        )}
        <p className="text-sm font-medium text-neutral-900">{product.name}</p>
        <p className="text-sm text-neutral-600">
          {formatPrice(toNumber(product.basePrice))}
        </p>
      </Link>
    </div>
  );
}
