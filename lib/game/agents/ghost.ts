import type { Direction, GhostState, Metrics, Vec } from "../types";
import { POWER_PILL_CELLS, isWall } from "../maze";
import { astar } from "../search/astar";
import { greedy } from "../search/greedy";
import { manhattan } from "../search/heuristics";

// All ghosts share one search engine and differ only in the target they aim at —
// distinct "personalities" at minimal code cost. Each step recomputes the route
// and executes only its first move (continuous replanning in a dynamic world).

const DIR_VECTORS: Record<Direction, Vec> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

const AMBUSH_LOOKAHEAD = 4;
const CAUTIOUS_THRESHOLD = 4;

export interface GhostDecision {
  next: Vec;
  metrics: Metrics;
}

/** Predict a cell ahead of Pac-Man, backing off if it lands on a wall. */
function ambushTarget(
  walls: boolean[][],
  pacman: Vec,
  dir: Direction,
): Vec {
  const d = DIR_VECTORS[dir];
  for (let n = AMBUSH_LOOKAHEAD; n >= 1; n--) {
    const cell = { r: pacman.r + d.r * n, c: pacman.c + d.c * n };
    if (!isWall(walls, cell)) return cell;
  }
  return pacman;
}

/** Pick the maze corner farthest from Pac-Man — used as a flee goal. */
function fleeTarget(pacman: Vec): Vec {
  let best = POWER_PILL_CELLS[0];
  let bestDist = -1;
  for (const corner of POWER_PILL_CELLS) {
    const d = manhattan(corner, pacman);
    if (d > bestDist) {
      bestDist = d;
      best = corner;
    }
  }
  return best;
}

function targetFor(
  ghost: GhostState,
  walls: boolean[][],
  pacman: Vec,
  pacmanDir: Direction,
): Vec {
  if (ghost.frightened) return fleeTarget(pacman);
  switch (ghost.personality) {
    case "chaser":
      return pacman;
    case "ambusher":
      return ambushTarget(walls, pacman, pacmanDir);
    case "cautious":
      // Pursue, but retreat home when Pac-Man gets uncomfortably close.
      return manhattan(ghost.pos, pacman) < CAUTIOUS_THRESHOLD
        ? ghost.home
        : pacman;
  }
}

export function decideGhostMove(
  ghost: GhostState,
  walls: boolean[][],
  pacman: Vec,
  pacmanDir: Direction,
): GhostDecision {
  const target = targetFor(ghost, walls, pacman, pacmanDir);
  // Frightened ghosts flee with Greedy (fast, "good enough"); hunters use A*.
  const result = ghost.frightened
    ? greedy(walls, ghost.pos, target)
    : astar(walls, ghost.pos, target);
  const next = result.path.length > 0 ? result.path[0] : ghost.pos;
  return { next, metrics: result.metrics };
}
