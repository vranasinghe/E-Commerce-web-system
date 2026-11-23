// Women's products that exist in the deployed catalog (photos are hosted on
// Cloudinary). Shared by the seed and by `db:add-womens-catalog`, so the catalog
// can be recreated in any database.
export const WOMENS_CATALOG_STOCK = 20;

export type CatalogProduct = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  gender: string;
  category: string;
  basePrice: number;
  colors: string[];
  images: string[];
};

const CDN = "https://res.cloudinary.com/dl2bc5pwj/image/upload";

export const WOMENS_CATALOG: CatalogProduct[] = [
  {
    name: "White Scoop Crop Top",
    slug: "white-scoop-crop-top",
    description: "Fitted cropped tank with a flattering scoop neckline in soft stretch cotton.",
    brand: "Everline",
    gender: "women",
    category: "tops",
    basePrice: 28,
    colors: ["White"],
    images: [
      `${CDN}/v1795227850/ecommerce-products/catalog-v2/white-scoop-crop-top/white-scoop-crop-top-front-f19e6f748719.webp`,
      `${CDN}/v1795228469/ecommerce-products/catalog-v2/white-scoop-crop-top/white-scoop-crop-top-left-2e9ac9f417a9.webp`,
      `${CDN}/v1795228470/ecommerce-products/catalog-v2/white-scoop-crop-top/white-scoop-crop-top-right-b2ba2f51ab1f.webp`,
      `${CDN}/v1795228471/ecommerce-products/catalog-v2/white-scoop-crop-top/white-scoop-crop-top-back-e7feff5b9175.webp`,
    ],
  },
  {
    name: "Blue Lace Mini Dress",
    slug: "blue-lace-mini-dress",
    description: "Sweetheart-neck mini dress in delicate pale blue lace with adjustable straps.",
    brand: "Aurelia",
    gender: "women",
    category: "dresses",
    basePrice: 88,
    colors: ["Blue"],
    images: [
      `${CDN}/v1795227849/ecommerce-products/catalog-v2/blue-lace-mini-dress/blue-lace-mini-dress-front-8057aa65f80e.webp`,
      `${CDN}/v1795228465/ecommerce-products/catalog-v2/blue-lace-mini-dress/blue-lace-mini-dress-left-4acc8dda6fa1.webp`,
      `${CDN}/v1795228467/ecommerce-products/catalog-v2/blue-lace-mini-dress/blue-lace-mini-dress-right-3345705d78c8.webp`,
      `${CDN}/v1795228468/ecommerce-products/catalog-v2/blue-lace-mini-dress/blue-lace-mini-dress-back-980c788ce5a7.webp`,
    ],
  },
  {
    name: "Blush Button Blouse",
    slug: "blush-button-blouse",
    description: "Relaxed satin-finish blouse in blush pink with a button front and rolled sleeves.",
    brand: "Everline",
    gender: "women",
    category: "tops",
    basePrice: 52,
    colors: ["Pink"],
    images: [
      `${CDN}/v1795227847/ecommerce-products/catalog-v2/blush-button-blouse/blush-button-blouse-front-b947d60e54ea.webp`,
      `${CDN}/v1795228462/ecommerce-products/catalog-v2/blush-button-blouse/blush-button-blouse-left-3be81c8bbd04.webp`,
      `${CDN}/v1795228463/ecommerce-products/catalog-v2/blush-button-blouse/blush-button-blouse-right-9dc510315c40.webp`,
      `${CDN}/v1795228464/ecommerce-products/catalog-v2/blush-button-blouse/blush-button-blouse-back-c85ebe06b9da.webp`,
    ],
  },
  {
    name: "Striped Crop Top",
    slug: "striped-crop-top",
    description: "Black and white striped knit crop top with a high neck and racerback.",
    brand: "Nomad",
    gender: "women",
    category: "tops",
    basePrice: 34,
    colors: ["Black"],
    images: [
      `${CDN}/v1795227845/ecommerce-products/catalog-v2/striped-crop-top/striped-crop-top-front-8dec1ca8c446.webp`,
      `${CDN}/v1795228458/ecommerce-products/catalog-v2/striped-crop-top/striped-crop-top-left-59cbfa6fb193.webp`,
      `${CDN}/v1795228459/ecommerce-products/catalog-v2/striped-crop-top/striped-crop-top-right-af70e866dd67.webp`,
      `${CDN}/v1795228461/ecommerce-products/catalog-v2/striped-crop-top/striped-crop-top-back-04c513ddf1db.webp`,
    ],
  },
  {
    name: "Yellow Flared Sundress",
    slug: "yellow-flared-sundress",
    description: "Breezy yellow sundress with a plunging neckline, tiered flared skirt and cross-back straps.",
    brand: "Aurelia",
    gender: "women",
    category: "dresses",
    basePrice: 78,
    colors: ["Yellow"],
    images: [
      `${CDN}/v1795227843/ecommerce-products/catalog-v2/yellow-flared-sundress/yellow-flared-sundress-front-d3c78f5b9317.webp`,
      `${CDN}/v1795228454/ecommerce-products/catalog-v2/yellow-flared-sundress/yellow-flared-sundress-left-5eaa65a27306.webp`,
      `${CDN}/v1795228455/ecommerce-products/catalog-v2/yellow-flared-sundress/yellow-flared-sundress-right-42c34feb87d7.webp`,
      `${CDN}/v1795228457/ecommerce-products/catalog-v2/yellow-flared-sundress/yellow-flared-sundress-back-12d2a8e918c9.webp`,
    ],
  },
];
