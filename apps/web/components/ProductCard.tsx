import Image from "next/image";
import Link from "next/link";
import { formatPrice, toNumber } from "@/lib/format";

export interface ProductCardData {
  slug: string;
  name: string;
  brand: string | null;
  basePrice: unknown;
  images: string[];
  category?: { name: string } | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0] ?? "/images/products/placeholder.svg";
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-0.5">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            {product.brand}
          </p>
        )}
        <p className="text-sm font-medium text-neutral-900">{product.name}</p>
        <p className="text-sm text-neutral-600">
          {formatPrice(toNumber(product.basePrice))}
        </p>
      </div>
    </Link>
  );
}
