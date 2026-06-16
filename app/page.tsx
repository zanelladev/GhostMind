"use client";

import GameCanvas from "@/components/GameCanvas";
import ControlPanel from "@/components/ControlPanel";
import MetricsPanel from "@/components/MetricsPanel";
import ThreatBadge from "@/components/ThreatBadge";
import { useGameLoop } from "@/hooks/useGameLoop";

const STATUS_LABEL: Record<string, string> = {
  playing: "Em andamento",
  won: "Vitória — labirinto limpo",
  lost: "Derrota — sem vidas",
};

export default function Home() {
  const game = useGameLoop();
  const { state } = game;

  return (
    <main
      className="mx-auto min-h-screen px-[24px] py-[40px]"
      style={{ maxWidth: "1200px" }}
    >
      {/* Header */}
      <header className="mb-[32px] flex flex-col gap-[8px]">
        <span
          className="font-mono text-[14px] font-bold"
          style={{ letterSpacing: "0.05em" }}
        >
          || GHOSTMIND
        </span>
        <h1 className="font-display text-[48px]" style={{ lineHeight: 1.08 }}>
          Perseguição inteligente em labirinto
        </h1>
        <p className="max-w-[640px] text-[16px]" style={{ color: "var(--color-driftwood)" }}>
          Fantasmas autônomos caçam com busca <strong>A*</strong> (heurística de
          Manhattan) e personalidades distintas; o Pac-Man foge com{" "}
          <strong>Greedy Best-First</strong>. Uma pílula de poder inverte os papéis,
          e um classificador <strong>Naive Bayes</strong> avalia o nível de ameaça
          do estado.
        </p>
      </header>

      <div className="flex flex-col gap-[24px] lg:flex-row lg:items-start">
        {/* Game */}
        <div className="flex flex-col gap-[16px]">
          <GameCanvas state={state} />
          <div
            className="flex items-center justify-between rounded-[20px] px-[16px] py-[12px]"
            style={{ background: "var(--surface-card)" }}
          >
            <span className="font-mono text-[13px]">
              Pontos {state.score} · Vidas {state.lives}
            </span>
            <span className="text-[13px]" style={{ color: "var(--color-driftwood)" }}>
              {STATUS_LABEL[state.status]}
              {state.powerTicks > 0 ? ` · poder ${state.powerTicks}` : ""}
            </span>
          </div>
        </div>

        {/* Controls + threat */}
        <aside className="flex w-full flex-col gap-[20px] lg:w-[300px]">
          <ControlPanel
            running={game.running}
            mode={game.mode}
            speed={game.speed}
            status={state.status}
            onToggleRunning={game.toggleRunning}
            onReset={game.reset}
            onSetMode={game.setMode}
            onSetSpeed={game.setSpeed}
          />
          <ThreatBadge
            threat={state.threat}
            proba={game.proba}
            samples={game.classifierSamples}
          />
        </aside>

        {/* Metrics — own column so it stays in view without scrolling */}
        <aside className="w-full lg:w-[300px]">
          <MetricsPanel state={state} />
        </aside>
      </div>
    </main>
  );
}
