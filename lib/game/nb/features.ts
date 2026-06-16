import type { GameState, ThreatLevel, Vec } from "../types";
import { manhattan } from "../search/heuristics";

// Feature extraction + ground-truth labelling for the Naive Bayes threat model.
// A game state is reduced to four attributes; the labelling heuristic provides
// the supervised target used to train the classifier on simulated states.

export const FEATURE_NAMES = [
  "distNearestGhost",
  "ghostsOnCollisionRoute",
  "powerPillsAvailable",
  "pillsRemaining",
] as const;

const COLLISION_RADIUS = 5;

export function extractFeatures(state: GameState): number[] {
  const pos: Vec = state.pacman.pos;

  let distNearestGhost = Infinity;
  let ghostsOnCollisionRoute = 0;
  for (const ghost of state.ghosts) {
    if (ghost.frightened) continue; // frightened ghosts are prey, not a threat
    const d = manhattan(pos, ghost.pos);
    if (d < distNearestGhost) distNearestGhost = d;
    if (d <= COLLISION_RADIUS) ghostsOnCollisionRoute++;
  }
  if (!Number.isFinite(distNearestGhost)) {
    distNearestGhost = state.rows + state.cols; // no active threat
  }

  return [
    distNearestGhost,
    ghostsOnCollisionRoute,
    state.powerPills.size,
    state.pills.size,
  ];
}

/**
 * Ground-truth label for a feature vector. This is the "expert" rule the Naive
 * Bayes model is trained to reproduce probabilistically, and also serves as the
 * engine's default classifier when no trained model is supplied.
 */
export function labelFeatures(features: number[]): ThreatLevel {
  const [distNearestGhost, ghostsOnRoute] = features;
  if (distNearestGhost <= 2) return "critical";
  if (distNearestGhost <= COLLISION_RADIUS || ghostsOnRoute >= 2) return "risk";
  return "safe";
}
