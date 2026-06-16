import { describe, expect, it } from "vitest";
import type { GhostState, Vec } from "../types";
import { decideGhostMove } from "./ghost";
import { manhattan } from "../search/heuristics";

// Fully-open grid isolates personality behaviour from maze geometry.
function openGrid(n = 11): boolean[][] {
  return Array.from({ length: n }, () => Array(n).fill(false));
}

function ghost(personality: GhostState["personality"], pos: Vec, home: Vec): GhostState {
  return {
    id: personality,
    personality,
    pos,
    home,
    metrics: { nodesExpanded: 0, pathLength: 0, timeMs: 0 },
    frightened: false,
  };
}

describe("ghost personalities", () => {
  const walls = openGrid();
  const pacman: Vec = { r: 5, c: 5 };

  it("chaser steps toward Pac-Man", () => {
    const g = ghost("chaser", { r: 5, c: 9 }, { r: 0, c: 0 });
    const { next } = decideGhostMove(g, walls, pacman, "left");
    expect(manhattan(next, pacman)).toBeLessThan(manhattan(g.pos, pacman));
  });

  it("cautious retreats home when Pac-Man is close", () => {
    const home = { r: 0, c: 0 };
    const g = ghost("cautious", { r: 5, c: 6 }, home); // distance 1 < threshold
    const { next } = decideGhostMove(g, walls, pacman, "left");
    expect(manhattan(next, home)).toBeLessThan(manhattan(g.pos, home));
  });

  it("chaser and cautious choose different moves in the same close state", () => {
    const home = { r: 0, c: 0 };
    const chaser = ghost("chaser", { r: 5, c: 6 }, home);
    const cautious = ghost("cautious", { r: 5, c: 6 }, home);
    const a = decideGhostMove(chaser, walls, pacman, "left").next;
    const b = decideGhostMove(cautious, walls, pacman, "left").next;
    expect(a).not.toEqual(b);
  });

  it("frightened ghost flees, increasing distance to Pac-Man", () => {
    const g = ghost("chaser", { r: 5, c: 4 }, { r: 0, c: 0 });
    g.frightened = true;
    const { next } = decideGhostMove(g, walls, pacman, "left");
    expect(manhattan(next, pacman)).toBeGreaterThanOrEqual(manhattan(g.pos, pacman));
  });
});
