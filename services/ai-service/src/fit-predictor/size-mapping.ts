export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

// Map a BMI value to a base size index.
export function bmiToSizeIndex(bmi: number): number {
  if (bmi < 18.5) return 1; // S
  if (bmi < 22) return 2; // M
  if (bmi < 25) return 3; // L
  if (bmi < 28) return 4; // XL
  return 5; // XXL
}
