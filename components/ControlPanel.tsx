"use client";

import type { GameMode, GameStatus } from "@/lib/game/types";

// Modern dark-mode control panel with purple-accent primary actions,
// refined borders, subtle shadows, and responsive toggle patterns.

interface Props {
  running: boolean;
  mode: GameMode;
  speed: number;
  status: GameStatus;
  onToggleRunning: () => void;
  onReset: () => void;
  onSetMode: (mode: GameMode) => void;
  onSetSpeed: (speed: number) => void;
}

const MODES: { value: GameMode; label: string }[] = [
  { value: "ai", label: "IA" },
  { value: "player", label: "Jogador" },
];

export default function ControlPanel({
  running,
  mode,
  speed,
  status,
  onToggleRunning,
  onReset,
  onSetMode,
  onSetSpeed,
}: Props) {
  const ended = status !== "playing";

  return (
    <div className="surface-card flex flex-col gap-[20px]">
      <h2 className="px-[24px] pt-[24px] text-[15px] font-medium">Controles</h2>

      {/* Mode switcher tabs */}
      <div className="px-[24px]">
        <div className="inline-flex gap-[6px] rounded-[16px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-[6px]">
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onSetMode(m.value)}
                className="rounded-[14px] px-[16px] py-[9px] text-[14px] font-medium transition-all duration-150"
                style={{
                  background: active ? "rgba(124, 58, 237, 0.25)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-muted)",
                  border: active ? "1px solid rgba(124, 58, 237, 0.4)" : "none",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary and secondary action buttons */}
      <div className="flex gap-[10px] px-[24px]">
        <button
          onClick={onToggleRunning}
          disabled={ended}
          className="accent-button flex-1 rounded-[12px] py-[12px] text-[14px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: !ended ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-soft))" : "rgba(124, 58, 237, 0.25)",
            color: "#fff",
          }}
        >
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={onReset}
          className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] py-[12px] px-[18px] text-[14px] font-medium text-[var(--color-text)] transition-all duration-150 hover:bg-[rgba(255,255,255,0.08)]"
        >
          Reiniciar
        </button>
      </div>

      {/* Speed slider */}
      <div className="border-t border-[rgba(255,255,255,0.05)] px-[24px] pb-[24px] pt-[18px]">
        <label className="flex flex-col gap-[12px]">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--color-muted)]">Velocidade</span>
            <span className="font-mono font-medium text-[var(--color-text)]">{speed} ticks/s</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={speed}
            onChange={(e) => onSetSpeed(Number(e.target.value))}
            className="h-[4px] w-full appearance-none rounded-full bg-[rgba(255,255,255,0.08)] accent-[var(--color-accent)]"
          />
        </label>
      </div>

      {mode === "player" && (
        <div className="border-t border-[rgba(255,255,255,0.05)] px-[24px] pb-[24px] pt-[18px]">
          <p className="text-[12px] text-[var(--color-muted)] leading-[1.5]">
            Use <kbd className="rounded px-[6px] py-[2px] bg-[rgba(255,255,255,0.08)] font-mono text-[11px]">↑↓←→</kbd> ou 
            <kbd className="rounded px-[6px] py-[2px] bg-[rgba(255,255,255,0.08)] font-mono text-[11px] ml-[4px]">WASD</kbd> para mover.
          </p>
        </div>
      )}
    </div>
  );
}
