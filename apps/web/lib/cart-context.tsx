"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { CartLine } from "@repo/types";
import { SignInRequiredModal } from "@/components/auth/SignInRequiredModal";

/** Fire after signing in or out so the cart and header re-check the session. */
export const AUTH_CHANGED_EVENT = "aura:auth-changed";

const STORAGE_KEY = "ecommerce-cart-v1";

type State = { lines: CartLine[] };

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "remove"; variantId: string }
  | { type: "setQty"; variantId: string; quantity: number }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines };
    case "add": {
      const existing = state.lines.find(
        (l) => l.variantId === action.line.variantId,
      );
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case "setQty":
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
      }
      return {
        lines: state.lines.map((l) =>
          l.variantId === action.variantId
            ? { ...l, quantity: action.quantity }
            : l,
        ),
      };
    case "clear":
      return { lines: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /**
   * Adds the line when the visitor is signed in. Signed-out visitors get the
   * sign-in prompt instead, and the promise resolves to false.
   */
  add: (line: CartLine) => Promise<boolean>;
  /** null while the session is still being checked. */
  signedIn: boolean | null;
  remove: (variantId: string) => void;
  setQty: (variantId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  // Don't write to storage until the saved cart has been read. Otherwise the
  // empty initial state overwrites it on a full page load (for example the
  // redirect to /login before checkout), and the shopper loses their cart.
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (hydrated.current) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", lines: JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
    hydrated.current = true;
  }, []);

  // Persist on change (only after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      /* storage unavailable */
    }
  }, [state.lines]);

  // Only signed-in customers (a real account or a demo account) can have a
  // cart. The session is re-checked on every page change and when another
  // component announces a sign-in or sign-out.
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const pendingLine = useRef<CartLine | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json()) as { user: unknown };
      setSignedIn(!!data.user);
      return !!data.user;
    } catch {
      setSignedIn(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    const onChange = () => void refreshSession();
    window.addEventListener(AUTH_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
  }, [refreshSession]);

  // Signed out (logged out, demo account expired, or a cart left over from
  // before sign-in was required): guests can't hold a cart, so empty it.
  useEffect(() => {
    if (signedIn === false && state.lines.length > 0) dispatch({ type: "clear" });
  }, [signedIn, state.lines.length]);

  const add = useCallback(
    async (line: CartLine) => {
      const ok = signedIn === null ? await refreshSession() : signedIn;
      if (!ok) {
        pendingLine.current = line;
        setPromptOpen(true);
        return false;
      }
      dispatch({ type: "add", line });
      return true;
    },
    [signedIn, refreshSession],
  );

  const closePrompt = useCallback(() => {
    pendingLine.current = null;
    setPromptOpen(false);
  }, []);

  // Demo sign-in from the prompt: finish adding the item the shopper wanted.
  const onSignedIn = useCallback(() => {
    setSignedIn(true);
    if (pendingLine.current) dispatch({ type: "add", line: pendingLine.current });
    pendingLine.current = null;
    setPromptOpen(false);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return {
      lines: state.lines,
      count,
      subtotal,
      add,
      signedIn,
      remove: (variantId) => dispatch({ type: "remove", variantId }),
      setQty: (variantId, quantity) =>
        dispatch({ type: "setQty", variantId, quantity }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.lines, add, signedIn]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <SignInRequiredModal open={promptOpen} onClose={closePrompt} onSignedIn={onSignedIn} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
