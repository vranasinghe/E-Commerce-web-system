import clsx, { type ClassValue } from "clsx";

/** Tiny className combiner shared across apps. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
