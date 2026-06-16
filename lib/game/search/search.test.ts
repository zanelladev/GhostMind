import { describe, expect, it } from "vitest";
import { astar } from "./astar";
import { greedy } from "./greedy";

// A tiny hand-built maze. `#` = wall, `.` = open. The detour around the central
// wall forces A* to find an optimal-length path while Greedy may wander.
//
//   col: 0 1 2 3 4
// row 0: . . . . .
// row 1: . # # # .
// row 2: . # . . .
// row 3: . # . # #
// row 4: . . . . .
function miniWalls(): boolean[][] {
  const g = [
    "....." ,
    ".###.",
    ".#...",
    ".#.##",
    ".....",
  ];
  return g.map((row) => [...row].map((ch) => ch === "#"));
}

describe("A* search", () => {
  it("finds an optimal-cost path on a known maze", () => {
    const walls = miniWalls();
    const res = astar(walls, { r: 0, c: 0 }, { r: 4, c: 4 });
    // Optimal path length: down the left column (4) + across the bottom (4) = 8.
    expect(res.path.length).toBe(8);
    expect(res.metrics.nodesExpanded).toBeGreaterThan(0);
    expect(res.path[res.path.length - 1]).toEqual({ r: 4, c: 4 });
  });

  it("returns an empty path when the goal is unreachable", () => {
    const walls = [
      [false, true, false],
      [false, true, false],
      [false, true, false],
    ];
    const res = astar(walls, { r: 0, c: 0 }, { r: 0, c: 2 });
    expect(res.path).toEqual([]);
  });
});

describe("Greedy Best-First search", () => {
  it("expands no more nodes than A* on an open grid (didactic comparison)", () => {
    // Fully open 9x9 grid: Greedy marches straight, A* explores more frontier.
    const walls = Array.from({ length: 9 }, () => Array(9).fill(false));
    const a = astar(walls, { r: 0, c: 0 }, { r: 8, c: 8 });
    const g = greedy(walls, { r: 0, c: 0 }, { r: 8, c: 8 });
    expect(g.metrics.nodesExpanded).toBeLessThanOrEqual(a.metrics.nodesExpanded);
    // Both still reach the goal.
    expect(g.path[g.path.length - 1]).toEqual({ r: 8, c: 8 });
  });
});
