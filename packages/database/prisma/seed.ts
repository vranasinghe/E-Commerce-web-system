import { PrismaClient, Prisma, Role } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

function fakeHash(password: string) {
  return "seed$" + createHash("sha256").update(password).digest("hex");
}

const SIZES = ["XS", "S", "M", "L", "XL"];

// ── Real Unsplash clothing images per product ────────────────────────────────
// Using stable Unsplash source URLs (free, no API key needed)
const PRODUCT_IMAGES: Record<string, string[]> = {
  "classic-cotton-tee": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
  ],
  "ribbed-knit-top": [
    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80",
    "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80",
    "https://images.unsplash.com/photo-1532453288672-3a54b975c54e?w=800&q=80",
  ],
  "oversized-boxy-tee": [
    "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  ],
  "silk-camisole": [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
    "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80",
  ],
  "linen-button-shirt": [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
    "https://images.unsplash.com/photo-1594938298603-3d5ea58e26bb?w=800&q=80",
  ],
  "wrap-midi-dress": [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
    "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80",
    "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&q=80",
  ],
  "slip-satin-dress": [
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
  ],
  "cotton-shirt-dress": [
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80",
    "https://images.unsplash.com/photo-1551163943-3f7253a97eaa?w=800&q=80",
  ],
  "knit-sweater-dress": [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80",
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
  ],
  "floral-tea-dress": [
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    "https://images.unsplash.com/photo-1585232350029-3b5c3b43da1d?w=800&q=80",
    "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
  ],
  "slim-fit-chinos": [
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
  ],
  "straight-leg-jeans": [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80",
    "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80",
  ],
  "tapered-jogger": [
    "https://images.unsplash.com/photo-1594938374182-a57b3fd4eaf0?w=800&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
  ],
  "pleated-trouser": [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1550246140-29f40b909e5a?w=800&q=80",
    "https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&q=80",
  ],
  "cargo-shorts": [
    "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
    "https://images.unsplash.com/photo-1617952236317-0bd127407984?w=800&q=80",
    "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
  ],
  "quilted-bomber-jacket": [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  ],
  "wool-overcoat": [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
    "https://images.unsplash.com/photo-1539533018257-8e1d7afe9c73?w=800&q=80",
    "https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=800&q=80",
  ],
  "denim-trucker-jacket": [
    "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80",
    "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
    "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80",
  ],
  "hooded-rain-shell": [
    "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=800&q=80",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80",
  ],
  "shearling-trucker": [
    "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=800&q=80",
    "https://images.unsplash.com/photo-1519997218465-9e0a80b6aacf?w=800&q=80",
    "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&q=80",
  ],
};

function getImages(slug: string): string[] {
  return PRODUCT_IMAGES[slug] ?? [
    `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80`,
    `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80`,
    `https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80`,
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
