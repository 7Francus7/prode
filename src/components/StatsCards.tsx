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
  valueClassName,
  style,
}: {
  value: ReactNode;
  label: string;
  valueClassName: string;
  style: CSSProperties;
}) {
  return (
    <div className="rounded-[1.35rem] px-3 py-4 text-center" style={style}>
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
        label="Puntos"
        valueClassName="font-display text-[1.8rem] font-bold leading-none text-white"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,24,36,0.92) 0%, rgba(10,14,22,0.92) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      />
      <StatCard
        value={<CountUp value={correctCount} className="font-display text-emerald-300" />}
        label="Aciertos"
        valueClassName="font-display text-[1.8rem] font-bold leading-none text-emerald-300"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,33,29,0.92) 0%, rgba(8,20,19,0.92) 100%)",
          border: "1px solid rgba(16,185,129,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      />
      <StatCard
        value={
          rank > 0 ? (
            <span>
              #<CountUp value={rank} className="font-display text-amber-300" />
            </span>
          ) : (
            "—"
          )
        }
        label="Posición"
        valueClassName="font-display text-[1.8rem] font-bold leading-none text-amber-300"
        style={{
          background:
            "linear-gradient(180deg, rgba(34,24,11,0.92) 0%, rgba(20,14,7,0.92) 100%)",
          border: "1px solid rgba(245,158,11,0.14)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      />
    </div>
  );
}
