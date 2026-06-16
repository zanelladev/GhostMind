import type { Direction, GameMode, GameState, GhostState, ThreatLevel, Vec } from "./types";
import {
  GHOST_SPAWNS,
  PACMAN_SPAWN,
  POWER_PILL_CELLS,
  buildPills,
  buildWalls,
  equals,
  key,
} from "./maze";
import { decideGhostMove } from "./agents/ghost";
import { decidePacmanAI, decidePacmanPlayer } from "./agents/pacman";
import { extractFeatures, labelFeatures } from "./nb/features";

// Authoritative game rules. `step` is a pure transition: it never mutates the
// input state, returning a fresh state each tick. Threat classification is
// injected (default = the labelling heuristic) so the Naive Bayes model stays
// decoupled and optional.

export const POWER_DURATION = 30; // ticks
export const INITIAL_LIVES = 3;

const PERSONALITIES = ["chaser", "ambusher", "cautious"] as const;

const SCORE_PILL = 10;
const SCORE_POWER_PILL = 50;
const SCORE_EAT_GHOST = 200;

export interface StepInputs {
  /** Desired direction in player mode (ignored in AI mode). */
  desiredDir?: Direction | null;
  /** Threat classifier; defaults to the labelling heuristic. */
  classify?: (features: number[]) => ThreatLevel;
}

export function createGame(mode: GameMode = "ai"): GameState {
  const walls = buildWalls();
  const ghosts: GhostState[] = GHOST_SPAWNS.map((spawn, i) => ({
    id: `ghost-${i}`,
    personality: PERSONALITIES[i % PERSONALITIES.length],
    pos: { ...spawn },
    home: { ...spawn },
    metrics: { nodesExpanded: 0, pathLength: 0, timeMs: 0 },
    frightened: false,
  }));

  return {
    rows: walls.length,
    cols: walls[0].length,
    walls,
    pills: buildPills(walls),
    powerPills: new Set(POWER_PILL_CELLS.map(key)),
    pacman: {
      pos: { ...PACMAN_SPAWN },
      dir: "left",
      metrics: { nodesExpanded: 0, pathLength: 0, timeMs: 0 },
    },
    ghosts,
    powerTicks: 0,
    mode,
    status: "playing",
    score: 0,
    lives: INITIAL_LIVES,
    threat: "safe",
    tick: 0,
  };
}

function cloneState(s: GameState): GameState {
  return {
    ...s,
    walls: s.walls, // static — safe to share
    pills: new Set(s.pills),
    powerPills: new Set(s.powerPills),
    pacman: { ...s.pacman, pos: { ...s.pacman.pos }, metrics: { ...s.pacman.metrics } },
    ghosts: s.ghosts.map((g) => ({
      ...g,
      pos: { ...g.pos },
      home: { ...g.home },
      metrics: { ...g.metrics },
    })),
  };
}

/** Reset agents to spawns after a death (keeps pills/score/threat). */
function respawnAgents(s: GameState): void {
  s.pacman.pos = { ...PACMAN_SPAWN };
  s.pacman.dir = "left";
  s.powerTicks = 0;
  s.ghosts.forEach((g, i) => {
    g.pos = { ...GHOST_SPAWNS[i] };
    g.frightened = false;
  });
}

/** Resolve any Pac-Man/ghost overlaps. Returns true if Pac-Man died. */
function resolveCollisions(s: GameState): boolean {
  for (const ghost of s.ghosts) {
    if (!equals(ghost.pos, s.pacman.pos)) continue;
    if (s.powerTicks > 0 && ghost.frightened) {
      // Pac-Man eats the frightened ghost; it returns home.
      s.score += SCORE_EAT_GHOST;
      ghost.pos = { ...ghost.home };
      ghost.frightened = false;
    } else {
      s.lives -= 1;
      if (s.lives <= 0) {
        s.status = "lost";
      } else {
        respawnAgents(s);
      }
      return true;
    }
  }
  return false;
}

/** Collect a pill/power pill at Pac-Man's cell, applying score + power mode. */
function collectAt(s: GameState, cell: Vec): void {
  const k = key(cell);
  if (s.pills.delete(k)) {
    s.score += SCORE_PILL;
  } else if (s.powerPills.delete(k)) {
    s.score += SCORE_POWER_PILL;
    s.powerTicks = POWER_DURATION;
    s.ghosts.forEach((g) => (g.frightened = true));
  }
}

export function step(state: GameState, inputs: StepInputs = {}): GameState {
  if (state.status !== "playing") return state;

  const next = cloneState(state);
  next.tick += 1;

  // 1. Classify threat from the current state (NB model or default heuristic).
  const classify = inputs.classify ?? labelFeatures;
  next.threat = classify(extractFeatures(next));

  // 2. Move Pac-Man.
  const pacDecision =
    next.mode === "player"
      ? decidePacmanPlayer(next, inputs.desiredDir ?? null)
      : decidePacmanAI(next);
  next.pacman.pos = pacDecision.next;
  next.pacman.dir = pacDecision.dir;
  next.pacman.metrics = pacDecision.metrics;

  collectAt(next, next.pacman.pos);
  if (resolveCollisions(next)) return finalize(next);
  if (next.pills.size === 0 && next.powerPills.size === 0) {
    next.status = "won";
    return next;
  }

  // 3. Move ghosts (continuous replanning against Pac-Man's new position).
  for (const ghost of next.ghosts) {
    const decision = decideGhostMove(ghost, next.walls, next.pacman.pos, next.pacman.dir);
    ghost.pos = decision.next;
    ghost.metrics = decision.metrics;
  }
  if (resolveCollisions(next)) return finalize(next);

  // 4. Tick down power mode.
  if (next.powerTicks > 0) {
    next.powerTicks -= 1;
    if (next.powerTicks === 0) next.ghosts.forEach((g) => (g.frightened = false));
  }

  return next;
}

function finalize(s: GameState): GameState {
  if (s.pills.size === 0 && s.powerPills.size === 0 && s.status === "playing") {
    s.status = "won";
  }
  return s;
}
