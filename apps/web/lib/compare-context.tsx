"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ecommerce-compare-v1";
const MAX_COMPARE = 4;

export interface CompareProduct {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  collection?: string;
  availability?: string;
  material?: string;
  vendor?: string;
  sku?: string;
  color?: string;
  size?: string;
  barcode?: string;
}

type State = { products: CompareProduct[] };

type Action =
  | { type: "hydrate"; products: CompareProduct[] }
  | { type: "add"; product: CompareProduct }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { products: action.products };
    case "add": {
      const exists = state.products.some((p) => p.productId === action.product.productId);
      if (exists || state.products.length >= MAX_COMPARE) return state;
      return { products: [...state.products, action.product] };
    }
    case "remove":
      return { products: state.products.filter((p) => p.productId !== action.productId) };
    case "clear":
      return { products: [] };
    default:
      return state;
  }
}

interface CompareContextValue {
  products: CompareProduct[];
  count: number;
  isComparing: (productId: string) => boolean;
  canAdd: boolean;
  add: (product: CompareProduct) => void;
  remove: (productId: string) => void;
  toggle: (product: CompareProduct) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { products: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", products: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
  }, [state.products]);

  const value = useMemo<CompareContextValue>(() => {
    return {
      products: state.products,
      count: state.products.length,
      isComparing: (productId) => state.products.some((p) => p.productId === productId),
      canAdd: state.products.length < MAX_COMPARE,
      add: (product) => dispatch({ type: "add", product }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      toggle: (product) => {
        const exists = state.products.some((p) => p.productId === product.productId);
        if (exists) dispatch({ type: "remove", productId: product.productId });
        else dispatch({ type: "add", product });
      },
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.products]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
