"use client";

import type { ThreatLevel } from "@/lib/game/types";

// Dark-mode threat assessment with neon indicators and gradient bars.
// Threat level conveyed via color-coded bars with glow effects.

const LABEL: Record<ThreatLevel, string> = {
  safe: "Seguro",
  risk: "Risco",
  critical: "Crítico",
};

const COLOR_MAP: Record<ThreatLevel, { bar: string; glow: string }> = {
  safe: { bar: "rgba(34, 197, 94, 0.8)", glow: "rgba(34, 197, 94, 0.3)" },
  risk: { bar: "rgba(251, 191, 36, 0.8)", glow: "rgba(251, 191, 36, 0.2)" },
  critical: { bar: "rgba(239, 68, 68, 0.8)", glow: "rgba(239, 68, 68, 0.25)" },
};

const ORDER: ThreatLevel[] = ["safe", "risk", "critical"];

export default function ThreatBadge({
  threat,
  proba,
  samples,
}: {
  threat: ThreatLevel;
  proba: Record<string, number>;
  samples: number;
}) {
  const color = COLOR_MAP[threat];

  return (
    <div
      className="surface-card flex flex-col gap-[16px] p-[24px]"
      style={{
        background: `linear-gradient(180deg, ${color.glow} 0%, transparent 100%), var(--color-surface)`,
        border: `1px solid ${color.glow}`,
      }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text)]">Ameaça</h2>
          <p className="mt-[4px] text-[12px] text-[var(--color-muted)]">Classificador Naive Bayes</p>
        </div>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">{samples} amostras</span>
      </div>

      <p
        className="text-[32px] font-bold leading-[1]"
        style={{ color: color.bar, textShadow: `0 0 12px ${color.glow}` }}
      >
        {LABEL[threat]}
      </p>

      <div className="flex flex-col gap-[8px]">
        {ORDER.map((level) => {
          const p = proba[level] ?? 0;
          const active = level === threat;
          const levelColor = COLOR_MAP[level];
          return (
            <div key={level} className="flex items-center gap-[10px]">
              <span
                className="w-[50px] text-[12px] font-medium"
                style={{ color: active ? levelColor.bar : "var(--color-muted)" }}
              >
                {LABEL[level]}
              </span>
              <div
                className="h-[5px] flex-1 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(p * 100).toFixed(0)}%`,
                    background: active ? `linear-gradient(90deg, ${levelColor.bar}, ${levelColor.bar}aa)` : `rgba(255,255,255,0.15)`,
                    boxShadow: active ? `0 0 6px ${levelColor.glow}` : "none",
                  }}
                />
              </div>
              <span className="w-[36px] text-right font-mono text-[11px] text-[var(--color-muted)]">
                {(p * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
