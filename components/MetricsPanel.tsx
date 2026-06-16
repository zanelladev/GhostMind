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
    <div
      className="grid grid-cols-[1fr_auto] gap-y-[2px] rounded-[14px] px-[12px] py-[10px]"
      style={{ background: "var(--surface-elevated)", boxShadow: "var(--shadow-subtle)" }}
    >
      <span className="text-[13px] font-medium">{name}</span>
      <span className="font-mono text-[11px]" style={{ color: "var(--color-driftwood)" }}>
        {algo}
      </span>
      <div className="col-span-2 mt-[4px] flex justify-between font-mono text-[11px]" style={{ color: "var(--color-driftwood)" }}>
        <span>nós {metrics.nodesExpanded}</span>
        <span>custo {metrics.pathLength}</span>
        <span>{metrics.timeMs.toFixed(2)} ms</span>
      </div>
    </div>
  );
}

export default function MetricsPanel({ state }: { state: GameState }) {
  return (
    <div
      className="flex flex-col gap-[8px] rounded-[20px] p-[16px]"
      style={{ background: "var(--surface-card)" }}
    >
      <h2 className="text-[14px] font-medium">Métricas de busca</h2>
      <Row name="Pac-Man" algo="Greedy" metrics={state.pacman.metrics} />
      {state.ghosts.map((g) => (
        <Row
          key={g.id}
          name={`${PERSONALITY_LABEL[g.personality]}${g.frightened ? " (fuga)" : ""}`}
          algo={g.frightened ? "Greedy" : "A*"}
          metrics={g.metrics}
        />
      ))}
    </div>
  );
}
