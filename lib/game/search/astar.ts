import type { SearchResult, Vec } from "../types";
import { bestFirstSearch } from "./bestFirst";

// A* — frontier ordered by f = g + h. With an admissible/consistent Manhattan
// heuristic this returns a least-cost path, ideal for the pursuing ghosts.
export function astar(walls: boolean[][], start: Vec, goal: Vec): SearchResult {
  return bestFirstSearch(walls, start, goal, (g, h) => g + h);
}
