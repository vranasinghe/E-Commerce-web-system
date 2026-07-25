// Shared TypeScript types used across web, admin, api and ai-service.

export interface CartLine {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RecommendationItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  score: number;
}

export interface VisualSearchResult {
  productId: string;
  slug: string;
  name: string;
  image: string;
  similarity: number;
}

export interface FitInput {
  heightCm: number;
  weightKg: number;
  fitPreference: "slim" | "regular" | "relaxed";
  productSlug: string;
}

export interface FitPrediction {
  recommendedSize: string;
  confidence: number; // 0..1
  rationale: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
