// Dedicated garment-only assets; never send the catalog model photo as clothing
// (the model's own trousers and background come along and ruin the result).
//
// Garment types map to AI providers in the AI service:
//   upper_body  tops and jackets   -> IDM-VTON
//   dress       dresses            -> OOTDiffusion (full body, "Dress")
//   lower_body  trousers, shorts   -> OOTDiffusion (full body, "Lower-body")
// Products that have no garment-only photo yet are intentionally absent.
export type TryOnGarmentType = "upper_body" | "lower_body" | "dress";

export interface TryOnGarment {
  image: string;
  color: string;
  type: TryOnGarmentType;
  /** Photo advice shown in the dialog; defaults to the advice for the type. */
  tip?: string;
}

export const TRYON_TIPS: Record<TryOnGarmentType, string> = {
  upper_body: "Use a clear, front-facing photo with your upper body visible.",
  dress:
    "Use a clear, front-facing, full-length photo. Wear close-fitting clothes: long trousers or a coat can show through the dress.",
  lower_body:
    "Use a clear, front-facing, full-length photo that shows your legs. Wear bottoms of a similar length to this item, because the result follows the length of what you are wearing.",
};

const img = (slug: string) => `https://res.cloudinary.com/dl2bc5pwj/image/upload/ecommerce/images/products/${slug}.webp`;

export const TRYON_GARMENTS: Record<string, TryOnGarment> = {
  // Tops
  "classic-cotton-tee": { image: img("classic-cotton-tee"), color: "White", type: "upper_body" },
  "ribbed-knit-top": { image: img("ribbed-knit-top"), color: "Ivory", type: "upper_body" },
  "oversized-boxy-tee": { image: img("oversized-boxy-tee"), color: "Stone", type: "upper_body" },
  "silk-camisole": { image: img("silk-camisole"), color: "Champagne", type: "upper_body" },
  "linen-button-shirt": { image: img("linen-button-shirt"), color: "White", type: "upper_body" },
  // Hip-length jackets (the long wool overcoat is not supported: it renders as a blazer)
  "denim-trucker-jacket": { image: img("denim-trucker-jacket"), color: "Washed Blue", type: "upper_body" },
  "shearling-trucker": { image: img("shearling-trucker"), color: "Indigo", type: "upper_body" },
  "hooded-rain-shell": { image: img("hooded-rain-shell"), color: "Slate", type: "upper_body" },
  "quilted-bomber-jacket": { image: img("quilted-bomber-jacket"), color: "Black", type: "upper_body" },
  // Dresses
  "wrap-midi-dress": { image: img("wrap-midi-dress"), color: "Emerald", type: "dress" },
  "slip-satin-dress": { image: img("slip-satin-dress"), color: "Blush", type: "dress" },
  "cotton-shirt-dress": { image: img("cotton-shirt-dress"), color: "Khaki", type: "dress" },
  "knit-sweater-dress": { image: img("knit-sweater-dress"), color: "Oatmeal", type: "dress" },
  "floral-tea-dress": { image: img("floral-tea-dress"), color: "Meadow", type: "dress" },
  // Trousers and shorts
  "slim-fit-chinos": { image: img("slim-fit-chinos"), color: "Navy", type: "lower_body" },
  "straight-leg-jeans": { image: img("straight-leg-jeans"), color: "Indigo", type: "lower_body" },
  "tapered-jogger": { image: img("tapered-jogger"), color: "Heather", type: "lower_body" },
  "pleated-trouser": { image: img("pleated-trouser"), color: "Charcoal", type: "lower_body" },
  "cargo-shorts": {
    image: img("cargo-shorts"),
    color: "Khaki",
    type: "lower_body",
    tip: "Use a clear, front-facing, full-length photo that shows your legs. Wear shorts, because the result follows the length of what you are wearing.",
  },
};
