"use client";

import CountUp from "./CountUp";

interface StatsCardsProps {
  totalPoints: number;
  correctCount: number;
  rank: number;
}

export default function StatsCards({ totalPoints, correctCount, rank }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="rounded-2xl bg-brand-card border border-brand-border px-3 py-4 text-center">
        <CountUp value={totalPoints} className="text-2xl font-black text-white leading-none" />
        <p className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-wider">Puntos</p>
      </div>
      <div className="rounded-2xl bg-brand-card border border-brand-border px-3 py-4 text-center">
        <CountUp value={correctCount} className="text-2xl font-black text-emerald-400 leading-none" />
        <p className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-wider">Aciertos</p>
      </div>
      <div className="rounded-2xl bg-brand-card border border-brand-border px-3 py-4 text-center">
        {rank > 0 ? (
          <p className="text-2xl font-black text-amber-400 leading-none">
            #<CountUp value={rank} className="text-amber-400" />
          </p>
        ) : (
          <p className="text-2xl font-black text-amber-400 leading-none">—</p>
        )}
        <p className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-wider">Posición</p>
      </div>
    </div>
  );
}
