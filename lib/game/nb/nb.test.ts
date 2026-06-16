import { describe, expect, it } from "vitest";
import { GaussianNB } from "./gaussianNB";
import { extractFeatures, labelFeatures } from "./features";
import { trainThreatClassifier } from "./train";
import { createGame } from "../engine";

describe("GaussianNB", () => {
  it("separates two well-spread 1D classes", () => {
    const X = [[0], [1], [0.5], [10], [11], [10.5]];
    const y = ["low", "low", "low", "high", "high", "high"];
    const nb = new GaussianNB().fit(X, y);
    expect(nb.predict([0.2])).toBe("low");
    expect(nb.predict([10.8])).toBe("high");
    const proba = nb.predictProba([0.2]);
    expect(proba.low + proba.high).toBeCloseTo(1, 5);
  });
});

describe("threat labelling + trained classifier", () => {
  it("labels an adjacent ghost as critical and a distant one as safe", () => {
    expect(labelFeatures([1, 1, 4, 100])).toBe("critical");
    expect(labelFeatures([20, 0, 4, 100])).toBe("safe");
  });

  it("trained model predicts critical when a ghost is adjacent", () => {
    const { classify, sampleCount } = trainThreatClassifier();
    expect(sampleCount).toBeGreaterThan(0);

    const state = createGame("ai");
    // One ghost adjacent to Pac-Man, the rest pushed far away.
    state.ghosts[0].pos = { r: state.pacman.pos.r, c: state.pacman.pos.c - 1 };
    state.ghosts[1].pos = { r: 1, c: 1 };
    state.ghosts[2].pos = { r: 1, c: 19 };
    expect(classify(extractFeatures(state))).toBe("critical");
  });

  it("trained model predicts safe when all ghosts are far", () => {
    const { classify } = trainThreatClassifier();
    const state = createGame("ai");
    state.ghosts.forEach((g, i) => {
      g.pos = i === 0 ? { r: 1, c: 1 } : { r: 1, c: 19 };
    });
    expect(classify(extractFeatures(state))).toBe("safe");
  });
});
