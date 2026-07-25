"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signupAction } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      id="signup-submit-btn"
      className="w-full py-3 px-4 text-sm font-bold tracking-widest text-white uppercase transition-all duration-200 disabled:opacity-50"
      style={{ background: "#e6186c" }}
    >
      {pending ? "Creating Account..." : "Signup"}
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [state, formAction] = useFormState(signupAction, null);
  const [role, setRole] = useState<"CUSTOMER" | "STAFF">("CUSTOMER");

  useEffect(() => {
    if (state?.success) {
      // Use role returned from server action for authoritative redirect
      if (state.role === "STAFF" || state.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(from && !from.startsWith("/admin") ? from : "/");
      }
      router.refresh();
    }
  }, [state, router, from]);

  return (
    <>
      {/* Breadcrumb banner */}
      <div className="bg-gray-50 border-b border-gray-200 py-5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">My Account</h1>
          <nav className="text-sm text-gray-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
            <span className="text-gray-300">|</span>
            <span className="text-pink-600 font-medium">Signup</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Create an Account
          </h2>

          {state?.error && (
            <div className="mb-5 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Account Type
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`flex-1 py-2.5 text-sm font-semibold border transition-all ${
                  role === "CUSTOMER"
                    ? "border-pink-500 text-pink-600 bg-pink-50"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("STAFF")}
                className={`flex-1 py-2.5 text-sm font-semibold border transition-all ${
                  role === "STAFF"
                    ? "border-pink-500 text-pink-600 bg-pink-50"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                Staff / Admin
              </button>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            {/* Hidden role field */}
            <input type="hidden" name="role" value={role} />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
              />
            </div>

            {/* Staff invite code - only shown for STAFF role */}
            {role === "STAFF" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Staff Invite Code
                </label>
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  required
                  placeholder="Enter your staff invite code"
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Demo code: <code className="font-mono bg-gray-100 px-1 rounded">STAFF-INVITE-2024</code>
                </p>
              </div>
            )}

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          <div className="mt-5 text-center">
            <Link
              href={`/login?from=${encodeURIComponent(from)}`}
              className="text-sm text-gray-500 underline hover:text-pink-600 transition-colors"
            >
              or Return to Store
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
