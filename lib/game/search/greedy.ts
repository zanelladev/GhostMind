import type { SearchResult, Vec } from "../types";
import { bestFirstSearch } from "./bestFirst";

// Greedy Best-First — frontier ordered by h only. Expands far fewer nodes and
// reacts faster than A*, at the cost of sometimes choosing non-optimal routes
// (dead ends). Used by Pac-Man, where "good enough, fast" beats optimality.
export function greedy(walls: boolean[][], start: Vec, goal: Vec): SearchResult {
  return bestFirstSearch(walls, start, goal, (_g, h) => h);
}
