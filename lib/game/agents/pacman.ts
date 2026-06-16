import type { Direction, GameState, Metrics, Vec } from "../types";
import { POWER_PILL_CELLS, fromKey, isWall } from "../maze";
import { greedy } from "../search/greedy";
import { manhattan } from "../search/heuristics";

// Pac-Man flees and collects with Greedy Best-First. In AI mode its stance
// (collect vs flee) is modulated by the Naive Bayes threat level; in player mode
// it simply follows the requested direction.

const DIR_VECTORS: Record<Direction, Vec> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

export interface PacmanDecision {
  next: Vec;
  dir: Direction;
  metrics: Metrics;
}

const EMPTY_METRICS: Metrics = { nodesExpanded: 0, pathLength: 0, timeMs: 0 };

function dirBetween(from: Vec, to: Vec, fallback: Direction): Direction {
  if (to.r < from.r) return "up";
  if (to.r > from.r) return "down";
  if (to.c < from.c) return "left";
  if (to.c > from.c) return "right";
  return fallback;
}

function nearest(from: Vec, cells: Vec[]): Vec | null {
  let best: Vec | null = null;
  let bestDist = Infinity;
  for (const cell of cells) {
    const d = manhattan(from, cell);
    if (d < bestDist) {
      bestDist = d;
      best = cell;
    }
  }
  return best;
}

/** Corner farthest from the nearest ghost — a sensible escape goal. */
function fleeGoal(from: Vec, ghosts: Vec[]): Vec {
  const threat = nearest(from, ghosts) ?? from;
  let best = POWER_PILL_CELLS[0];
  let bestDist = -1;
  for (const corner of POWER_PILL_CELLS) {
    const d = manhattan(corner, threat);
    if (d > bestDist) {
      bestDist = d;
      best = corner;
    }
  }
  return best;
}

function moveToward(state: GameState, goal: Vec): PacmanDecision {
  const result = greedy(state.walls, state.pacman.pos, goal);
  if (result.path.length === 0) {
    return { next: state.pacman.pos, dir: state.pacman.dir, metrics: result.metrics };
  }
  const next = result.path[0];
  return {
    next,
    dir: dirBetween(state.pacman.pos, next, state.pacman.dir),
    metrics: result.metrics,
  };
}

/** Autonomous Pac-Man: choose a goal based on power mode + NB threat stance. */
export function decidePacmanAI(state: GameState): PacmanDecision {
  const pos = state.pacman.pos;
  const ghostCells = state.ghosts.map((g) => g.pos);

  // Power mode: go on the offensive and hunt the frightened ghosts.
  if (state.powerTicks > 0) {
    const prey = nearest(pos, ghostCells);
    if (prey) return moveToward(state, prey);
  }

  const powerPills = [...state.powerPills].map(fromKey);
  const pills = [...state.pills].map(fromKey);

  if (state.threat === "critical") {
    // When cornered, dash for a power pill to flip the matchup if one exists.
    const grab = nearest(pos, powerPills);
    return moveToward(state, grab ?? fleeGoal(pos, ghostCells));
  }

  if (state.threat === "risk") {
    return moveToward(state, fleeGoal(pos, ghostCells));
  }

  // Safe: collect the nearest reward.
  const reward = nearest(pos, [...pills, ...powerPills]);
  if (reward) return moveToward(state, reward);
  return { next: pos, dir: state.pacman.dir, metrics: EMPTY_METRICS };
}

/** Player-controlled Pac-Man: step in the requested direction if walkable. */
export function decidePacmanPlayer(
  state: GameState,
  desiredDir: Direction | null,
): PacmanDecision {
  const pos = state.pacman.pos;
  const dir = desiredDir ?? state.pacman.dir;
  const d = DIR_VECTORS[dir];
  const next = { r: pos.r + d.r, c: pos.c + d.c };
  if (isWall(state.walls, next)) {
    return { next: pos, dir, metrics: EMPTY_METRICS };
  }
  return { next, dir, metrics: EMPTY_METRICS };
}
