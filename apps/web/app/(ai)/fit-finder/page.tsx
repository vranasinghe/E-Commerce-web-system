"use client";

import { useState } from "react";
import { Ruler, Sparkles } from "lucide-react";
import { Button } from "@repo/ui";
import type { FitPrediction } from "@repo/types";

export default function FitFinderPage() {
  const [form, setForm] = useState({
    heightCm: 175,
    weightKg: 70,
    fitPreference: "regular" as "slim" | "regular" | "relaxed",
    productSlug: "classic-cotton-tee",
  });
  const [result, setResult] = useState<FitPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/fit-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setResult(await res.json());
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-neutral-400">
          <Sparkles className="h-4 w-4" /> AI Size &amp; Fit Predictor
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Find your perfect size</h1>
        <p className="mt-2 text-neutral-500">
          Answer a few questions and we&apos;ll recommend a size.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Height (cm)">
            <input
              type="number"
              value={form.heightCm}
              onChange={(e) =>
                setForm((f) => ({ ...f, heightCm: Number(e.target.value) }))
              }
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              type="number"
              value={form.weightKg}
              onChange={(e) =>
                setForm((f) => ({ ...f, weightKg: Number(e.target.value) }))
              }
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm"
            />
          </Field>
        </div>

        <Field label="Preferred fit">
          <div className="flex gap-2">
            {(["slim", "regular", "relaxed"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((f) => ({ ...f, fitPreference: p }))}
                className={`flex-1 rounded-md border py-2 text-sm capitalize ${
                  form.fitPreference === p
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Calculating…" : "Get my size"}
        </Button>
      </form>

      {result && (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
          <Ruler className="mx-auto h-6 w-6 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">We recommend</p>
          <p className="text-4xl font-semibold">{result.recommendedSize}</p>
          <p className="mt-2 text-sm text-neutral-500">{result.rationale}</p>
          <p className="mt-1 text-xs text-neutral-400">
            Confidence: {Math.round(result.confidence * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
