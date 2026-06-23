"use client";

import type { GameState, Metrics } from "@/lib/game/types";

// Per-agent search metrics — the didactic core: A* (ghosts) vs Greedy (Pac-Man).
// Geist Mono distinguishes these technical readouts from body text.

const PERSONALITY_LABEL: Record<string, string> = {
  chaser: "Perseguidor",
  ambusher: "Emboscador",
  cautious: "Cauteloso",
};

function Row({
  name,
  algo,
  metrics,
}: {
  name: string;
  algo: string;
  metrics: Metrics;
}) {
  return (
    <div className="rounded-[16px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-[14px] transition-all duration-150 hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-[10px] mb-[10px]">
        <span className="text-[13px] font-medium text-[var(--color-text)]">{name}</span>
        <span
          className="rounded-full px-[8px] py-[4px] text-[11px] font-medium"
          style={{
            background: "rgba(124, 58, 237, 0.15)",
            color: "var(--color-accent)",
          }}
        >
          {algo}
        </span>
      </div>
      <div className="flex justify-between gap-[8px] font-mono text-[11px]">
        <span className="text-[var(--color-muted)]">nós: {metrics.nodesExpanded}</span>
        <span className="text-[var(--color-muted)]">custo: {metrics.pathLength}</span>
        <span className="text-[var(--color-muted)]">{metrics.timeMs.toFixed(1)}ms</span>
      </div>
    </div>
  );
}

export default function MetricsPanel({ state }: { state: GameState }) {
  return (
    <div className="surface-card flex flex-col gap-[14px] p-[24px]">
      <div>
        <h2 className="text-[15px] font-medium text-[var(--color-text)]">Métricas de busca</h2>
        <p className="mt-[4px] text-[12px] text-[var(--color-muted)]">Agentes de pathfinding</p>
      </div>
      <div className="flex flex-col gap-[10px]">
        <Row name="Pac-Man" algo="Greedy" metrics={state.pacman.metrics} />
        {state.ghosts.map((g) => (
          <Row
            key={g.id}
            name={`${PERSONALITY_LABEL[g.personality]}${g.frightened ? " ⚡" : ""}`}
            algo={g.frightened ? "Greedy" : "A*"}
            metrics={g.metrics}
          />
        ))}
      </div>
    </div>
  );
}
