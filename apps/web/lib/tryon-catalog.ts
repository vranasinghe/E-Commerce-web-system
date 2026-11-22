// Dedicated garment-only assets; never send the catalog model photo as clothing.
// The provider (IDM-VTON) only renders upper-body garments, so this list is limited
// to tops and jackets. Dresses, trousers and shorts are not supported.
export const TRYON_GARMENTS: Record<string, { image: string; color: string }> = {
  "classic-cotton-tee": { image: "/images/products/classic-cotton-tee.webp", color: "White" },
  "ribbed-knit-top": { image: "/images/products/ribbed-knit-top.webp", color: "Ivory" },
  "oversized-boxy-tee": { image: "/images/products/oversized-boxy-tee.webp", color: "Stone" },
  "silk-camisole": { image: "/images/products/silk-camisole.webp", color: "Champagne" },
  "linen-button-shirt": { image: "/images/products/linen-button-shirt.webp", color: "White" },
  "denim-trucker-jacket": { image: "/images/products/denim-trucker-jacket.webp", color: "Washed Blue" },
  "shearling-trucker": { image: "/images/products/shearling-trucker.webp", color: "Indigo" },
  "hooded-rain-shell": { image: "/images/products/hooded-rain-shell.webp", color: "Slate" },
  "quilted-bomber-jacket": { image: "/images/products/quilted-bomber-jacket.webp", color: "Black" },
};
