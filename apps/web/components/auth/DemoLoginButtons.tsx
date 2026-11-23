"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShoppingBag } from "lucide-react";
import { demoLoginAction, demoLoginEnabledAction } from "@/app/actions/auth";

/**
 * One-click demo sign-in. Each click creates a temporary account whose data is
 * deleted after 24 hours. Renders nothing when demo login is switched off.
 */
export function DemoLoginButtons({ from }: { from?: string | null }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<"CUSTOMER" | "ADMIN" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    demoLoginEnabledAction().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  function start(role: "CUSTOMER" | "ADMIN") {
    setError(null);
    setActive(role);
    startTransition(async () => {
      const res = await demoLoginAction(role);
      if ("error" in res) {
        setError(res.error);
        setActive(null);
        return;
      }
      if (res.role === "ADMIN") {
        router.push(from?.startsWith("/admin") ? from : "/admin");
      } else {
        router.push(from && !from.startsWith("/admin") ? from : "/");
      }
      router.refresh();
    });
  }

  const base =
    "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60";

  return (
    <div className="mt-4 rounded-xl border border-gray-100 bg-white/70 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/70">
      <p className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
        Just looking around? Try a demo account
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => start("CUSTOMER")}
          id="demo-customer-btn"
          className={`${base} border-pink-200 text-pink-600 hover:bg-pink-50`}
        >
          {pending && active === "CUSTOMER" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingBag className="h-4 w-4" />
          )}
          Demo customer
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => start("ADMIN")}
          id="demo-admin-btn"
          className={`${base} border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800`}
        >
          {pending && active === "ADMIN" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Demo admin
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-3 text-[11px] text-gray-400">
        Creates a temporary account. It and everything you do with it (orders,
        address, cart) is deleted after 24 hours.
      </p>
    </div>
  );
}
