"use client";

import GameCanvas from "@/components/GameCanvas";
import ControlPanel from "@/components/ControlPanel";
import MetricsPanel from "@/components/MetricsPanel";
import SettingsPanel from "@/components/SettingsPanel";
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
    <main className="page-shell mx-auto max-w-[1200px]">
      <header className="mb-[32px] rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-[28px] shadow-soft backdrop-blur-[12px]">
        <div className="flex flex-col gap-[14px]">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
            ghostmind
          </span>
          <h1 className="text-[44px] font-display leading-[1.02] sm:text-[56px]">
            Perseguição inteligente em labirinto
          </h1>
          <p className="max-w-[720px] text-[15px] leading-[1.8] text-[var(--color-muted)]">
            Fantasmas autônomos caçam com <strong>A*</strong> e personalidades
            distintas, enquanto o Pac-Man foge com <strong>Greedy Best-First</strong>.
            Um power-up inverte os papéis e um classificador <strong>Naive Bayes</strong>
            avalia o nível de ameaça em tempo real.
          </p>
        </div>
      </header>

      <div className="grid gap-[24px] xl:grid-cols-[1.4fr_0.8fr]">
        <div className="grid gap-[18px]">
          <GameCanvas state={state} />

          <div className="surface-card flex flex-col gap-[10px] p-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-[4px]">
              <p className="text-[13px] font-medium text-[var(--color-muted)]">Resumo</p>
              <p className="text-[15px] font-medium text-[var(--color-text)]">
                Pontos {state.score} · Vidas {state.lives}
              </p>
            </div>
            <p className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[8px] text-[13px] font-medium text-[var(--color-muted)]">
              {STATUS_LABEL[state.status]}
              {state.powerTicks > 0 ? ` · poder ${state.powerTicks}` : ""}
            </p>
          </div>
        </div>

        <aside className="grid gap-[20px]">
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

          <SettingsPanel settings={game.settings} onChange={game.setSettings} />

          <ThreatBadge threat={state.threat} proba={game.proba} samples={game.classifierSamples} />

          <MetricsPanel state={state} />
        </aside>
      </div>
    </main>
  );
}
