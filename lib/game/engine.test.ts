import { describe, expect, it } from "vitest";
import { POWER_DURATION, createGame, step } from "./engine";

describe("engine", () => {
  it("creates a playable initial state", () => {
    const s = createGame("ai");
    expect(s.status).toBe("playing");
    expect(s.ghosts).toHaveLength(3);
    expect(s.pills.size).toBeGreaterThan(0);
    expect(s.powerPills.size).toBe(4);
    expect(s.tick).toBe(0);
  });

  it("advances the tick and never mutates the input state", () => {
    const s = createGame("ai");
    const before = s.tick;
    const next = step(s);
    expect(s.tick).toBe(before); // input untouched
    expect(next.tick).toBe(before + 1);
    expect(next).not.toBe(s);
  });

  it("collecting a power pill frightens the ghosts and starts power mode", () => {
    const s = createGame("player");
    // Place Pac-Man next to the top-left power pill (1,1) and push ghosts away.
    s.pacman.pos = { r: 1, c: 2 };
    s.pacman.dir = "left";
    s.ghosts.forEach((g) => (g.pos = { r: 19, c: 19 }));

    const next = step(s, { desiredDir: "left" });
    expect(next.pacman.pos).toEqual({ r: 1, c: 1 });
    expect(next.powerTicks).toBe(POWER_DURATION - 1); // ticked down once this step
    expect(next.ghosts.every((g) => g.frightened)).toBe(true);
    expect(next.powerPills.has("1,1")).toBe(false);
    expect(next.score).toBeGreaterThan(0);
  });

  it("ends the game when the maze is cleared", () => {
    const s = createGame("ai");
    s.pills.clear();
    s.powerPills.clear();
    const next = step(s);
    expect(next.status).toBe("won");
  });
});
