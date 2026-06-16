// Shared types for the GhostMind engine. The engine is pure TypeScript with no
// React/DOM dependency so it can be unit-tested and ported.

/** A grid coordinate. `c` = column (x), `r` = row (y). */
export interface Vec {
  r: number;
  c: number;
}

export type CellType = "wall" | "path";

/** Search metrics surfaced in the live metrics panel. */
export interface Metrics {
  nodesExpanded: number;
  pathLength: number;
  timeMs: number;
}

export interface SearchResult {
  /** Cells from start (exclusive) to goal (inclusive). Empty when unreachable. */
  path: Vec[];
  metrics: Metrics;
}

export type GhostPersonality = "chaser" | "ambusher" | "cautious";

export type Direction = "up" | "down" | "left" | "right";

export interface GhostState {
  id: string;
  personality: GhostPersonality;
  pos: Vec;
  /** Home corner used as the retreat point (cautious) and respawn. */
  home: Vec;
  /** Last computed search metrics, shown per-agent in the panel. */
  metrics: Metrics;
  /** True while the ghost is frightened (fleeing) during power mode. */
  frightened: boolean;
}

export interface PacmanState {
  pos: Vec;
  dir: Direction;
  metrics: Metrics;
}

export type ThreatLevel = "safe" | "risk" | "critical";

export type GameMode = "ai" | "player";
export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  rows: number;
  cols: number;
  /** Static wall layout: walls[r][c] === true means impassable. */
  walls: boolean[][];
  /** Remaining normal pills, keyed by "r,c". */
  pills: Set<string>;
  /** Remaining power pills, keyed by "r,c". */
  powerPills: Set<string>;
  pacman: PacmanState;
  ghosts: GhostState[];
  /** Ticks of power mode remaining (0 = inactive). */
  powerTicks: number;
  mode: GameMode;
  status: GameStatus;
  score: number;
  lives: number;
  /** Most recent threat level predicted by the Naive Bayes classifier. */
  threat: ThreatLevel;
  /** Monotonic tick counter. */
  tick: number;
}
