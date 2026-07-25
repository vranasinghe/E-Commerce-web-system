"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ecommerce-wishlist-v1";

export interface WishlistItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  color?: string;
  size?: string;
}

type State = { items: WishlistItem[] };

type Action =
  | { type: "hydrate"; items: WishlistItem[] }
  | { type: "add"; item: WishlistItem }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const exists = state.items.some((i) => i.variantId === action.item.variantId);
      if (exists) return state;
      return { items: [...state.items, action.item] };
    }
    case "remove":
      return { items: state.items.filter((i) => i.variantId !== action.variantId) };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isWishlisted: (variantId: string) => boolean;
  add: (item: WishlistItem) => void;
  remove: (variantId: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo<WishlistContextValue>(() => {
    return {
      items: state.items,
      count: state.items.length,
      isWishlisted: (variantId) => state.items.some((i) => i.variantId === variantId),
      add: (item) => dispatch({ type: "add", item }),
      remove: (variantId) => dispatch({ type: "remove", variantId }),
      toggle: (item) => {
        const exists = state.items.some((i) => i.variantId === item.variantId);
        if (exists) dispatch({ type: "remove", variantId: item.variantId });
        else dispatch({ type: "add", item });
      },
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
