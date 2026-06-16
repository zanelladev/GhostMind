import type { Vec } from "../types";

// Manhattan distance: admissible and consistent on a 4-connected grid with unit
// step cost, so it preserves A*'s optimality while staying cheap to compute.
export function manhattan(a: Vec, b: Vec): number {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}
