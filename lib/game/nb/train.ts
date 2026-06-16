import type { GameState, ThreatLevel, Vec } from "../types";
import { createGame, step } from "../engine";
import { extractFeatures, labelFeatures } from "./features";
import { GaussianNB } from "./gaussianNB";

// Generate a labelled dataset from simulated self-play and fit a Gaussian Naive
// Bayes threat classifier. Training runs in-browser at startup — it is fast
// (a few hundred simulated ticks) and demonstrably reproduces the expert
// labelling rule as a probabilistic model.

export interface TrainedClassifier {
  classify: (features: number[]) => ThreatLevel;
  sampleCount: number;
  proba: (features: number[]) => Record<string, number>;
}

/** Deterministic PRNG (mulberry32) so training is reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function openCells(state: GameState): Vec[] {
  const cells: Vec[] = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (!state.walls[r][c]) cells.push({ r, c });
    }
  }
  return cells;
}

const NUM_GAMES = 12;
const TICKS_PER_GAME = 60;

export function trainThreatClassifier(seed = 1337): TrainedClassifier {
  const rand = mulberry32(seed);
  const X: number[][] = [];
  const y: ThreatLevel[] = [];

  for (let g = 0; g < NUM_GAMES; g++) {
    let state = createGame("ai");
    const cells = openCells(state);
    // Scatter ghosts to random open cells for state-space variety.
    state.ghosts.forEach((ghost) => {
      ghost.pos = { ...cells[Math.floor(rand() * cells.length)] };
    });

    for (let t = 0; t < TICKS_PER_GAME; t++) {
      const features = extractFeatures(state);
      X.push(features);
      y.push(labelFeatures(features));
      state = step(state);
      if (state.status !== "playing") break;
    }
  }

  const model = new GaussianNB().fit(X, y);

  return {
    classify: (features) => model.predict(features) as ThreatLevel,
    proba: (features) => model.predictProba(features),
    sampleCount: X.length,
  };
}
