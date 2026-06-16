"use client";

import { useEffect, useRef } from "react";
import type { GameState, GhostState } from "@/lib/game/types";

// Renders the maze, pills and agents to a 2D canvas. The UI chrome stays
// monochrome parchment; the decorative accent colours (violet / orange) appear
// only here, on the game elements themselves — never as UI state.

const CELL = 26;

const COLORS = {
  bg: "#f5f3f1", // warm sand maze floor
  wall: "#000000", // midnight ink walls
  pill: "#a59f97", // fog
  powerPill: "#ff4704", // ember orange
  pacman: "#ff4704", // ember orange
  ghost: "#0447ff", // void violet (hunting)
  ghostFrightened: "#b1b0b0", // silver mist (fleeing)
  ghostLabel: "#ffffff",
} as const;

const PERSONALITY_INITIAL: Record<GhostState["personality"], string> = {
  chaser: "C",
  ambusher: "A",
  cautious: "U",
};

function center(idx: number): number {
  return idx * CELL + CELL / 2;
}

function drawGhost(ctx: CanvasRenderingContext2D, ghost: GhostState): void {
  const x = ghost.pos.c * CELL;
  const y = ghost.pos.r * CELL;
  const r = CELL / 2 - 3;
  const cx = x + CELL / 2;
  const cy = y + CELL / 2;

  ctx.fillStyle = ghost.frightened ? COLORS.ghostFrightened : COLORS.ghost;
  ctx.beginPath();
  ctx.arc(cx, cy - 1, r, Math.PI, 0); // dome
  ctx.lineTo(cx + r, cy + r);
  // wavy skirt
  const feet = 3;
  for (let i = 0; i < feet; i++) {
    const fx = cx + r - ((i + 0.5) * (2 * r)) / feet;
    ctx.lineTo(fx, cy + r - 4);
    ctx.lineTo(cx + r - ((i + 1) * (2 * r)) / feet, cy + r);
  }
  ctx.closePath();
  ctx.fill();

  // personality initial
  ctx.fillStyle = COLORS.ghostLabel;
  ctx.font = "600 11px var(--font-geist-mono), monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(PERSONALITY_INITIAL[ghost.personality], cx, cy);
}

function drawPacman(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { pos, dir } = state.pacman;
  const cx = center(pos.c);
  const cy = center(pos.r);
  const r = CELL / 2 - 2;
  const mouth = 0.28 * Math.PI;
  const base: Record<string, number> = { right: 0, down: 0.5, left: 1, up: 1.5 };
  const rot = base[dir] * Math.PI;

  ctx.fillStyle = COLORS.pacman;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, rot + mouth, rot + 2 * Math.PI - mouth);
  ctx.closePath();
  ctx.fill();
}

export default function GameCanvas({ state }: { state: GameState }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = state.cols * CELL;
    const h = state.rows * CELL;

    // floor
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, w, h);

    // walls
    ctx.fillStyle = COLORS.wall;
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.walls[r][c]) {
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // pills
    ctx.fillStyle = COLORS.pill;
    for (const k of state.pills) {
      const [r, c] = k.split(",").map(Number);
      ctx.beginPath();
      ctx.arc(center(c), center(r), 2.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // power pills (pulse via tick)
    const pulse = 4 + 2 * Math.abs(Math.sin(state.tick / 3));
    ctx.fillStyle = COLORS.powerPill;
    for (const k of state.powerPills) {
      const [r, c] = k.split(",").map(Number);
      ctx.beginPath();
      ctx.arc(center(c), center(r), pulse, 0, 2 * Math.PI);
      ctx.fill();
    }

    state.ghosts.forEach((g) => drawGhost(ctx, g));
    drawPacman(ctx, state);
  }, [state]);

  return (
    <canvas
      ref={ref}
      width={state.cols * CELL}
      height={state.rows * CELL}
      className="rounded-[20px]"
      style={{ boxShadow: "var(--shadow-elevated)", background: COLORS.bg }}
    />
  );
}
