import type { Vec } from "./types";

// Static, pre-defined maze (v0.1 scope: no editor / procedural generation).
// We build a regular corridor lattice that is guaranteed fully connected:
//   - odd interior rows are fully open horizontal corridors;
//   - even interior rows are walls, pierced by vertical "connector" columns.
// This keeps every path cell reachable while reading like a Pac-Man grid.

export const ROWS = 21;
export const COLS = 21;

const CONNECTOR_COLS = [2, 6, 10, 14, 18];

/** Pac-Man starting cell (bottom-center corridor). */
export const PACMAN_SPAWN: Vec = { r: 19, c: 10 };

/** Ghost spawns + their home/retreat corners. */
export const GHOST_SPAWNS: Vec[] = [
  { r: 1, c: 2 },
  { r: 1, c: 18 },
  { r: 9, c: 10 },
];

/** Power-pill cells (four corridor corners). */
export const POWER_PILL_CELLS: Vec[] = [
  { r: 1, c: 1 },
  { r: 1, c: 19 },
  { r: 19, c: 1 },
  { r: 19, c: 19 },
];

function isWallCell(r: number, c: number): boolean {
  if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return true;
  if (r % 2 === 1) return false; // open corridor row
  return !CONNECTOR_COLS.includes(c); // wall row, open only at connectors
}

/** Build the static wall grid. walls[r][c] === true means impassable. */
export function buildWalls(): boolean[][] {
  const walls: boolean[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < COLS; c++) row.push(isWallCell(r, c));
    walls.push(row);
  }
  return walls;
}

export function key(v: Vec): string {
  return `${v.r},${v.c}`;
}

export function fromKey(k: string): Vec {
  const [r, c] = k.split(",").map(Number);
  return { r, c };
}

export function equals(a: Vec, b: Vec): boolean {
  return a.r === b.r && a.c === b.c;
}

export function isWall(walls: boolean[][], v: Vec): boolean {
  if (v.r < 0 || v.r >= walls.length || v.c < 0 || v.c >= walls[0].length) return true;
  return walls[v.r][v.c];
}

const DELTAS: Vec[] = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
];

/** Walkable orthogonal neighbours of a cell (4-connectivity). */
export function neighbors(walls: boolean[][], v: Vec): Vec[] {
  const out: Vec[] = [];
  for (const d of DELTAS) {
    const n = { r: v.r + d.r, c: v.c + d.c };
    if (!isWall(walls, n)) out.push(n);
  }
  return out;
}

export function allOpenCells(walls: boolean[][]): Vec[] {
  const openCells: Vec[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!walls[r][c]) openCells.push({ r, c });
    }
  }
  return openCells;
}

/** Initial set of normal pills: every open cell except spawns and power pills. */
export function buildPills(walls: boolean[][], extraReserved: Iterable<string> = []): Set<string> {
  const reserved = new Set<string>([
    key(PACMAN_SPAWN),
    ...GHOST_SPAWNS.map(key),
    ...POWER_PILL_CELLS.map(key),
    ...extraReserved,
  ]);
  const pills = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = { r, c };
      if (!walls[r][c] && !reserved.has(key(v))) pills.add(key(v));
    }
  }
  return pills;
}
