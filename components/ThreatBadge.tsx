"use client";

import type { ThreatLevel } from "@/lib/game/types";

// Naive Bayes threat readout. Per DESIGN.md we avoid loud semantic colours —
// the level is conveyed with text, weight and a subtle monochrome meter, not
// green/red status chips.

const LABEL: Record<ThreatLevel, string> = {
  safe: "Seguro",
  risk: "Risco",
  critical: "Crítico",
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
  return (
    <div
      className="flex flex-col gap-[10px] rounded-[20px] p-[16px]"
      style={{ background: "var(--surface-card)" }}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-medium">Nível de ameaça</h2>
        <span className="font-mono text-[10px]" style={{ color: "var(--color-fog)" }}>
          Naive Bayes · {samples} amostras
        </span>
      </div>

      <p className="font-display text-[32px]" style={{ letterSpacing: "-0.02em" }}>
        {LABEL[threat]}
      </p>

      <div className="flex flex-col gap-[6px]">
        {ORDER.map((level) => {
          const p = proba[level] ?? 0;
          const active = level === threat;
          return (
            <div key={level} className="flex items-center gap-[8px]">
              <span className="w-[56px] text-[12px]" style={{ color: "var(--color-driftwood)" }}>
                {LABEL[level]}
              </span>
              <div
                className="h-[6px] flex-1 overflow-hidden rounded-full"
                style={{ background: "var(--surface-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(p * 100).toFixed(0)}%`,
                    background: active
                      ? "var(--color-midnight-ink)"
                      : "var(--color-silver-mist)",
                  }}
                />
              </div>
              <span className="w-[36px] text-right font-mono text-[11px]" style={{ color: "var(--color-driftwood)" }}>
                {(p * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
