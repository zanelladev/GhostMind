"use client";

import type { GameSettings } from "@/lib/game/types";

const DIFFICULTY_OPTIONS: { value: GameSettings["difficulty"]; label: string }[] = [
  { value: "easy", label: "Fácil" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Difícil" },
];

export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
}) {
  return (
    <div className="surface-card p-[24px]">
      <div className="mb-[18px] flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-medium">Configurações de gameplay</h2>
          <p className="mt-[6px] text-[13px] text-[var(--color-muted)]">
            Ajuste o comportamento dos fantasmas e a dificuldade do jogo.
          </p>
        </div>
        <span className="rounded-full bg-[rgba(124,58,237,0.12)] px-[10px] py-[6px] text-[12px] font-medium text-[var(--color-accent)]">
          🎮</span>
      </div>

      <div className="flex flex-col gap-[20px]">
        <div className="grid gap-[10px]">
          <label className="flex items-center justify-between gap-[12px] text-[14px] font-medium">
            <span>Spawn aleatório de fantasmas</span>
            <button
              type="button"
              onClick={() => onChange({ ...settings, ghostSpawnRandom: !settings.ghostSpawnRandom })}
              className="relative inline-flex h-[32px] w-[56px] items-center rounded-full p-[4px] transition-colors duration-150"
              style={{
                background: settings.ghostSpawnRandom ? "var(--color-accent)" : "var(--color-border)",
              }}
              aria-pressed={settings.ghostSpawnRandom}
            >
              <span
                className="inline-block h-[24px] w-[24px] rounded-full bg-white transition-transform duration-150"
                style={{ transform: settings.ghostSpawnRandom ? "translateX(24px)" : "translateX(0)" }}
              />
            </button>
          </label>
          <p className="text-[12px] text-[var(--color-muted)]">
            Quando ativado, os fantasmas surgem em posições válidas aleatórias, mantendo distância segura de Pac-Man.
          </p>
        </div>

        <div className="grid gap-[10px]">
          <div className="flex items-center justify-between text-[14px] font-medium">
            <span>Distância mínima de spawn</span>
            <span className="font-mono text-[13px] text-[var(--color-text)]">{settings.minSpawnDistance}</span>
          </div>
          <input
            type="range"
            min={4}
            max={14}
            step={1}
            value={settings.minSpawnDistance}
            onChange={(e) => onChange({ ...settings, minSpawnDistance: Number(e.target.value) })}
            className="h-[4px] w-full appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
          />
        </div>

        <div className="grid gap-[10px]">
          <div className="flex items-center justify-between text-[14px] font-medium">
            <span>Tentativas máximas</span>
            <span className="font-mono text-[13px] text-[var(--color-text)]">{settings.maxSpawnAttempts}</span>
          </div>
          <input
            type="range"
            min={4}
            max={24}
            step={1}
            value={settings.maxSpawnAttempts}
            onChange={(e) => onChange({ ...settings, maxSpawnAttempts: Number(e.target.value) })}
            className="h-[4px] w-full appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
          />
        </div>

        <div className="grid gap-[10px]">
          <div className="flex items-center justify-between text-[14px] font-medium">
            <span>Quantidade de fantasmas</span>
            <span className="font-mono text-[13px] text-[var(--color-text)]">{settings.ghostCount}</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={1}
            value={settings.ghostCount}
            onChange={(e) => onChange({ ...settings, ghostCount: Number(e.target.value) })}
            className="h-[4px] w-full appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
          />
        </div>

        <div className="grid gap-[10px]">
          <span className="text-[14px] font-medium">Dificuldade</span>
          <div className="inline-flex flex-wrap gap-[8px]">
            {DIFFICULTY_OPTIONS.map((option) => {
              const active = option.value === settings.difficulty;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...settings, difficulty: option.value })}
                  className="rounded-full px-[14px] py-[10px] text-[13px] font-medium transition-colors duration-150"
                  style={{
                    background: active ? "var(--color-accent)" : "rgba(255,255,255,0.04)",
                    color: active ? "#ffffff" : "var(--color-text)",
                    border: active ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
