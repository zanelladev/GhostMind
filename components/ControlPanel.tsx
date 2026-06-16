"use client";

import type { GameMode, GameStatus } from "@/lib/game/types";

// Monochrome pill controls per DESIGN.md: black filled = primary action,
// white outlined = secondary, rounded tab badges = the mode switcher.

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
    <div className="flex flex-col gap-[16px]">
      {/* Mode switcher */}
      <div
        className="inline-flex gap-[4px] rounded-[20px] p-[4px]"
        style={{ background: "var(--surface-card)" }}
      >
        {MODES.map((m) => {
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => onSetMode(m.value)}
              className="rounded-[18px] px-[14px] py-[8px] text-[14px] font-medium transition-colors"
              style={{
                background: active ? "var(--surface-elevated)" : "transparent",
                boxShadow: active ? "var(--shadow-subtle)" : "none",
                color: "var(--color-midnight-ink)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Primary / secondary actions */}
      <div className="flex items-center gap-[8px]">
        <button
          onClick={onToggleRunning}
          disabled={ended}
          className="rounded-full px-[16px] py-[8px] text-[15px] font-medium disabled:opacity-40"
          style={{ background: "var(--color-midnight-ink)", color: "#ffffff" }}
        >
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={onReset}
          className="rounded-full px-[12px] py-[8px] text-[15px] font-medium"
          style={{
            background: "var(--surface-canvas)",
            color: "var(--color-midnight-ink)",
            border: "1px solid var(--surface-border)",
            boxShadow: "var(--shadow-control)",
          }}
        >
          Reiniciar
        </button>
      </div>

      {/* Speed */}
      <label className="flex flex-col gap-[4px] text-[12px]" style={{ color: "var(--color-driftwood)" }}>
        <span>
          Velocidade: <span className="font-mono">{speed}</span> passos/s
        </span>
        <input
          type="range"
          min={1}
          max={20}
          value={speed}
          onChange={(e) => onSetSpeed(Number(e.target.value))}
          style={{ accentColor: "var(--color-midnight-ink)" }}
        />
      </label>

      {mode === "player" && (
        <p className="text-[12px]" style={{ color: "var(--color-fog)" }}>
          Use as setas ou WASD para mover o Pac-Man.
        </p>
      )}
    </div>
  );
}
