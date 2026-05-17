"use client";

import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/types";

interface MyPositionBannerProps {
  entry: RankingEntry;
  total: number;
}

export default function MyPositionBanner({ entry, total }: MyPositionBannerProps) {
  const medalColors: Record<number, string> = {
    1: "text-brand-gold",
    2: "text-brand-silver",
    3: "text-brand-bronze",
  };
  const rankColor = medalColors[entry.rank] ?? "text-white";

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-brand-dark/90 backdrop-blur-md border-b border-brand-border animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center shrink-0">
          <span className={cn("text-[28px] font-black leading-none tabular-nums", rankColor)}>
            #{entry.rank}
          </span>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">de {total}</span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{entry.name ?? "Vos"}</p>
          <p className="text-[10px] text-slate-600">Tu posición</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 shrink-0">
          <div className="text-center">
            <p className="text-[18px] font-black text-white leading-none">{entry.totalPoints}</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider">pts</p>
          </div>
          <div className="text-center">
            <p className="text-[18px] font-black text-emerald-400 leading-none">{entry.correctPredictions}</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider">aciertos</p>
          </div>
          <div className="text-center">
            <p className="text-[18px] font-black text-amber-400 leading-none">{entry.accuracy}%</p>
            <p className="text-[9px] text-slate-600 uppercase tracking-wider">efect.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
