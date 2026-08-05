import { PrismaClient, Prisma, Role } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function fakeHash(password: string) {
  return "seed$" + createHash("sha256").update(password).digest("hex");
}

const SIZES = ["XS", "S", "M", "L", "XL"];

// ── Local project clothing images per product ────────────────────────────────
const PRODUCT_IMAGES: Record<string, string[]> = {
  "classic-cotton-tee": [
    "/images/products/classic-cotton-tee.svg",
    "/images/products/placeholder.svg",
  ],
  "ribbed-knit-top": [
    "/images/products/ribbed-knit-top.svg",
    "/images/products/placeholder.svg",
  ],
  "oversized-boxy-tee": [
    "/images/products/oversized-boxy-tee.svg",
    "/images/products/placeholder.svg",
  ],
  "silk-camisole": [
    "/images/products/silk-camisole.svg",
    "/images/products/placeholder.svg",
  ],
  "linen-button-shirt": [
    "/images/products/linen-button-shirt.svg",
    "/images/products/placeholder.svg",
  ],
  "wrap-midi-dress": [
    "/images/products/wrap-midi-dress.svg",
    "/images/products/placeholder.svg",
  ],
  "slip-satin-dress": [
    "/images/products/slip-satin-dress.svg",
    "/images/products/placeholder.svg",
  ],
  "cotton-shirt-dress": [
    "/images/products/cotton-shirt-dress.svg",
    "/images/products/placeholder.svg",
  ],
  "knit-sweater-dress": [
    "/images/products/knit-sweater-dress.svg",
    "/images/products/placeholder.svg",
  ],
  "floral-tea-dress": [
    "/images/products/floral-tea-dress.svg",
    "/images/products/placeholder.svg",
  ],
  "slim-fit-chinos": [
    "/images/products/tapered-trousers.svg",
    "/images/products/placeholder.svg",
  ],
  "straight-leg-jeans": [
    "/images/products/slim-fit-jeans.svg",
    "/images/products/placeholder.svg",
  ],
  "tapered-jogger": [
    "/images/products/wide-leg-trousers.svg",
    "/images/products/placeholder.svg",
  ],
  "pleated-trouser": [
    "/images/products/pleated-midi-skirt.svg",
    "/images/products/placeholder.svg",
  ],
  "cargo-shorts": [
    "/images/products/linen-shorts.svg",
    "/images/products/placeholder.svg",
  ],
  "quilted-bomber-jacket": [
    "/images/products/wool-tailored-blazer.svg",
    "/images/products/placeholder.svg",
  ],
  "wool-overcoat": [
    "/images/products/trench-coat.svg",
    "/images/products/placeholder.svg",
  ],
  "denim-trucker-jacket": [
    "/images/products/denim-jacket.svg",
    "/images/products/placeholder.svg",
  ],
  "hooded-rain-shell": [
    "/images/products/puffer-jacket.svg",
    "/images/products/placeholder.svg",
  ],
  "shearling-trucker": [
    "/images/products/biker-leather-jacket.svg",
    "/images/products/placeholder.svg",
  ],
};

function getImages(slug: string): string[] {
  return PRODUCT_IMAGES[slug] ?? [
    "/images/products/placeholder.svg",
  ];
}

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  gender: string;
  category: string;
  basePrice: number;
  colors: string[];
  featured?: boolean;
};

const CATEGORIES = [
  { name: "Women", slug: "women", parent: null },
  { name: "Men", slug: "men", parent: null },
  { name: "Tops", slug: "tops", parent: "women" },
  { name: "Dresses", slug: "dresses", parent: "women" },
  { name: "Bottoms", slug: "bottoms", parent: "men" },
  { name: "Outerwear", slug: "outerwear", parent: "men" },
];

const PRODUCTS: SeedProduct[] = [
  { name: "Classic Cotton Tee", slug: "classic-cotton-tee", description: "A breathable everyday crew-neck tee in soft combed cotton.", brand: "Everline", gender: "women", category: "tops", basePrice: 24.0, colors: ["White", "Black", "Sage"], featured: true },
  { name: "Ribbed Knit Top", slug: "ribbed-knit-top", description: "Fitted ribbed top with a flattering scoop neckline.", brand: "Everline", gender: "women", category: "tops", basePrice: 32.0, colors: ["Ivory", "Rust"] },
  { name: "Oversized Boxy Tee", slug: "oversized-boxy-tee", description: "Relaxed drop-shoulder tee for an effortless silhouette.", brand: "Nomad", gender: "women", category: "tops", basePrice: 28.0, colors: ["Stone", "Black"], featured: true },
  { name: "Silk Camisole", slug: "silk-camisole", description: "Luxe washable-silk cami that layers under anything.", brand: "Aurelia", gender: "women", category: "tops", basePrice: 58.0, colors: ["Champagne", "Navy"] },
  { name: "Linen Button Shirt", slug: "linen-button-shirt", description: "Airy European linen shirt with a relaxed cut.", brand: "Nomad", gender: "women", category: "tops", basePrice: 68.0, colors: ["White", "Sky"] },
  { name: "Wrap Midi Dress", slug: "wrap-midi-dress", description: "Flowing wrap dress with a tie waist and midi hem.", brand: "Aurelia", gender: "women", category: "dresses", basePrice: 89.0, colors: ["Emerald", "Black"], featured: true },
  { name: "Slip Satin Dress", slug: "slip-satin-dress", description: "Bias-cut satin slip dress with adjustable straps.", brand: "Aurelia", gender: "women", category: "dresses", basePrice: 98.0, colors: ["Blush", "Charcoal"] },
  { name: "Cotton Shirt Dress", slug: "cotton-shirt-dress", description: "Crisp poplin shirt dress with a belted waist.", brand: "Everline", gender: "women", category: "dresses", basePrice: 76.0, colors: ["Stripe", "Khaki"] },
  { name: "Knit Sweater Dress", slug: "knit-sweater-dress", description: "Cozy ribbed sweater dress for cooler days.", brand: "Nomad", gender: "women", category: "dresses", basePrice: 84.0, colors: ["Oatmeal", "Wine"] },
  { name: "Floral Tea Dress", slug: "floral-tea-dress", description: "Vintage-inspired tea dress in a soft floral print.", brand: "Aurelia", gender: "women", category: "dresses", basePrice: 92.0, colors: ["Meadow", "Dusk"] },
  { name: "Slim Fit Chinos", slug: "slim-fit-chinos", description: "Stretch-cotton chinos with a clean slim leg.", brand: "Forge", gender: "men", category: "bottoms", basePrice: 64.0, colors: ["Navy", "Stone", "Olive"], featured: true },
  { name: "Straight Leg Jeans", slug: "straight-leg-jeans", description: "Mid-wash straight jeans in rigid selvedge denim.", brand: "Forge", gender: "men", category: "bottoms", basePrice: 88.0, colors: ["Indigo", "Black"] },
  { name: "Tapered Jogger", slug: "tapered-jogger", description: "Heavyweight fleece jogger with a tapered ankle.", brand: "Forge", gender: "men", category: "bottoms", basePrice: 58.0, colors: ["Heather", "Black"] },
  { name: "Pleated Trouser", slug: "pleated-trouser", description: "Tailored pleated trouser in a wool blend.", brand: "Meridian", gender: "men", category: "bottoms", basePrice: 96.0, colors: ["Charcoal", "Camel"] },
  { name: "Cargo Shorts", slug: "cargo-shorts", description: "Utility cargo shorts in durable ripstop cotton.", brand: "Forge", gender: "men", category: "bottoms", basePrice: 46.0, colors: ["Khaki", "Black"] },
  { name: "Quilted Bomber Jacket", slug: "quilted-bomber-jacket", description: "Lightweight quilted bomber with a ribbed collar.", brand: "Meridian", gender: "men", category: "outerwear", basePrice: 128.0, colors: ["Black", "Forest"], featured: true },
  { name: "Wool Overcoat", slug: "wool-overcoat", description: "Timeless single-breasted overcoat in Italian wool.", brand: "Meridian", gender: "men", category: "outerwear", basePrice: 245.0, colors: ["Camel", "Charcoal"] },
  { name: "Denim Trucker Jacket", slug: "denim-trucker-jacket", description: "Classic trucker jacket in rigid non-stretch denim.", brand: "Forge", gender: "men", category: "outerwear", basePrice: 98.0, colors: ["Washed Blue", "Ecru"] },
  { name: "Hooded Rain Shell", slug: "hooded-rain-shell", description: "Packable waterproof shell with taped seams.", brand: "Nomad", gender: "men", category: "outerwear", basePrice: 112.0, colors: ["Slate", "Yellow"] },
  { name: "Shearling Trucker", slug: "shearling-trucker", description: "Denim trucker lined with cozy faux shearling.", brand: "Forge", gender: "men", category: "outerwear", basePrice: 156.0, colors: ["Indigo"] },
];

async function main() {
  console.log("🌱  Seeding database with real clothing images...");

  // Clean (order matters due to FKs)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@store.dev",
      name: "Store Admin",
      role: Role.ADMIN,
      passwordHash: fakeHash("admin123"),
    },
  });
  const customer = await prisma.user.create({
    data: {
      email: "shopper@store.dev",
      name: "Sam Shopper",
      role: Role.CUSTOMER,
      passwordHash: fakeHash("shop123"),
    },
  });
  const staff = await prisma.user.create({
    data: {
      email: "staff@store.dev",
      name: "Store Staff",
      role: Role.STAFF,
      passwordHash: fakeHash("staff123"),
    },
  });
  console.log(`   • users: ${admin.email}, ${staff.email}, ${customer.email}`);

  // Categories (parents first, then children)
  const catBySlug = new Map<string, string>();
  for (const c of CATEGORIES.filter((c) => c.parent === null)) {
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug },
    });
    catBySlug.set(c.slug, created.id);
  }
  for (const c of CATEGORIES.filter((c) => c.parent !== null)) {
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug, parentId: catBySlug.get(c.parent!) },
    });
    catBySlug.set(c.slug, created.id);
  }
  console.log(`   • categories: ${CATEGORIES.length}`);

  // Products + variants
  for (const p of PRODUCTS) {
    const categoryId = catBySlug.get(p.category)!;
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand: p.brand,
        gender: p.gender,
        basePrice: new Prisma.Decimal(p.basePrice),
        images: getImages(p.slug),
        featured: p.featured ?? false,
        categoryId,
        variants: {
          create: SIZES.flatMap((size) =>
            p.colors.map((color) => ({
              sku: `${p.slug}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-"),
              size,
              color,
              stock: 5 + Math.floor(Math.random() * 30),
              price: new Prisma.Decimal(p.basePrice),
            })),
          ),
        },
      },
    });

    // Reviews on featured products
    if (p.featured) {
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: customer.id,
          rating: 5,
          title: "Love it",
          body: "Great quality and true to size. Would buy again.",
        },
      });
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: customer.id,
          rating: 4,
          title: "Really good",
          body: "Soft fabric, great fit. Shipping was fast.",
        },
      });
    }
  }
  console.log(`   • products: ${PRODUCTS.length} (with real Unsplash clothing images)`);

  // Coupon
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your first order",
      percentOff: 10,
      minSubtotal: new Prisma.Decimal(50),
      active: true,
    },
  });
  console.log("   • coupon: WELCOME10");

  console.log("✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
