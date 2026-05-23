"use client";

import type { CSSProperties, ReactNode } from "react";
import CountUp from "./CountUp";

interface StatsCardsProps {
  totalPoints: number;
  correctCount: number;
  rank: number;
}

function StatCard({
  value,
  label,
  eyebrow,
  valueClassName,
  style,
}: {
  value: ReactNode;
  label: string;
  eyebrow: string;
  valueClassName: string;
  style: CSSProperties;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.45rem] border px-3 py-4 text-center" style={style}>
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <div className={valueClassName}>{value}</div>
      <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
    </div>
  );
}

export default function StatsCards({ totalPoints, correctCount, rank }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard
        value={<CountUp value={totalPoints} className="font-display text-white" />}
        eyebrow="Campana"
        label="Puntos"
        valueClassName="font-display mt-3 text-[1.8rem] font-bold leading-none text-white"
        style={{
          background: "var(--app-stat-neutral-bg)",
          border: "1px solid var(--app-stat-neutral-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      />
      <StatCard
        value={<CountUp value={correctCount} className="font-display text-emerald-300" />}
        eyebrow="Pulso"
        label="Aciertos"
        valueClassName="font-display mt-3 text-[1.8rem] font-bold leading-none text-emerald-300"
        style={{
          background: "var(--app-stat-emerald-bg)",
          border: "1px solid var(--app-stat-emerald-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      />
      <StatCard
        value={
          rank > 0 ? (
            <span>
              #<CountUp value={rank} className="font-display text-amber-300" />
            </span>
          ) : (
            "-"
          )
        }
        eyebrow="Ranking"
        label="Posicion"
        valueClassName="font-display mt-3 text-[1.8rem] font-bold leading-none text-amber-300"
        style={{
          background: "var(--app-stat-amber-bg)",
          border: "1px solid var(--app-stat-amber-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      />
    </div>
  );
}
