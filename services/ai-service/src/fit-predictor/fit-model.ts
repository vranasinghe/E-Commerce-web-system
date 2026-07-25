import type { FitInput, FitPrediction } from "@repo/types";
import { SIZES, bmiToSizeIndex } from "./size-mapping";

// Simple rules + scoring model. Production would additionally blend the user's
// past order sizes (UserSizeProfile / OrderItem history) and per-product charts.
export function predictFit(input: FitInput): FitPrediction {
  const { heightCm, weightKg, fitPreference } = input;
  const bmi = weightKg / Math.pow(heightCm / 100, 2);

  let idx = bmiToSizeIndex(bmi);
  if (heightCm >= 190 && idx < SIZES.length - 1) idx += 1;
  if (fitPreference === "relaxed" && idx < SIZES.length - 1) idx += 1;
  if (fitPreference === "slim" && idx > 0) idx -= 1;
  idx = Math.min(Math.max(idx, 0), SIZES.length - 1);

  const bandCenters = [16, 20, 23.5, 26.5, 30];
  const nearest = bandCenters.reduce(
    (best, c) => Math.min(best, Math.abs(bmi - c)),
    Infinity,
  );
  const confidence = Math.max(0.6, Math.min(0.95, 0.95 - nearest / 20));

  return {
    recommendedSize: SIZES[idx]!,
    confidence,
    rationale:
      `Based on your height/weight (BMI ~${bmi.toFixed(1)}) and a ${fitPreference} fit, ` +
      `${SIZES[idx]} should fit best.`,
  };
}
