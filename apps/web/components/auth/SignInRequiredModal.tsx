"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogIn, ShoppingBag, UserPlus, X } from "lucide-react";
import { demoLoginAction, demoLoginEnabledAction } from "@/app/actions/auth";

/**
 * Shown when a signed-out visitor tries to add something to the cart. Offers a
 * one-click demo customer (when demo login is enabled), sign in, or sign up.
 * `onSignedIn` runs after a successful demo sign-in so the item can be added.
 */
export function SignInRequiredModal({
  open,
  onClose,
  onSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignedIn: () => void;
}) {
  const pathname = usePathname();
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    demoLoginEnabledAction().then(setDemoEnabled).catch(() => setDemoEnabled(false));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const from = encodeURIComponent(pathname || "/");

  function startDemo() {
    setError(null);
    startTransition(async () => {
      const res = await demoLoginAction("CUSTOMER");
      if ("error" in res) {
        setError(res.error);
        return;
      }
      onSignedIn();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-required-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50">
          <ShoppingBag className="h-6 w-6 text-pink-500" />
        </div>
        <h2 id="signin-required-title" className="mt-4 text-center text-lg font-semibold">
          Sign in to add items to your cart
        </h2>
        <p className="mt-1 text-center text-sm text-neutral-500">
          You need to be signed in to shop. Use a demo account or your own account.
        </p>

        <div className="mt-5 space-y-2">
          {demoEnabled && (
            <button
              type="button"
              onClick={startDemo}
              disabled={pending}
              id="signin-modal-demo-btn"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              Continue with demo account
            </button>
          )}
          <Link
            href={`/login?from=${from}`}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            <LogIn className="h-4 w-4" /> Sign in to my account
          </Link>
          <Link
            href={`/signup?from=${from}`}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            <UserPlus className="h-4 w-4" /> Create an account
          </Link>
        </div>

        {error && <p className="mt-3 text-center text-xs text-red-600">{error}</p>}
        {demoEnabled && (
          <p className="mt-4 text-center text-[11px] text-neutral-400">
            Demo accounts and their data are deleted after 24 hours.
          </p>
        )}
      </div>
    </div>
  );
}
