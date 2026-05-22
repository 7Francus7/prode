"use client";

import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/types";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const MEDAL = ["🥇", "🥈", "🥉"] as const;

interface RankingTableProps {
  entries: RankingEntry[];
  currentUserId?: string;
  startFrom?: number;
}

export default function RankingTable({
  entries,
  currentUserId,
  startFrom = 1,
}: RankingTableProps) {
  return (
    <div className="rounded-2xl border border-brand-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2rem_1fr_3.5rem_3rem_3rem] items-center px-4 py-2.5 border-b border-brand-border bg-black/20">
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.14em]">#</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.14em]">Jugador</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.14em] text-center">Pts</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.14em] text-center hidden sm:block">Ac.</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.14em] text-center hidden sm:block">%</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-brand-border">
        {entries.map((entry, i) => {
          const rank = entry.rank ?? startFrom + i;
          const isMe = entry.id === currentUserId;
          return (
            <div
              key={entry.id}
              className={cn(
                "grid grid-cols-[2rem_1fr_3.5rem_3rem_3rem] items-center px-4 py-3 transition-colors",
                isMe
                  ? "bg-blue-600/8 border-l-2 border-l-blue-500"
                  : "[@media(hover:hover)]:hover:bg-white/[0.02]"
              )}
            >
              {/* Rank */}
              <span className="text-xs font-bold">
                {rank <= 3 ? (
                  <span>{MEDAL[rank - 1]}</span>
                ) : (
                  <span className="text-slate-600 font-mono">{rank}</span>
                )}
              </span>

              {/* Player */}
              <div className="flex items-center gap-2.5 min-w-0">
                {entry.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image}
                    alt={entry.name ?? ""}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-brand-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    {getInitials(entry.name)}
                  </div>
                )}
                <span
                  className={cn(
                    "text-sm font-semibold truncate",
                    isMe ? "text-blue-400" : "text-white"
                  )}
                >
                  {entry.name ?? "Anónimo"}
                  {isMe && (
                    <span className="ml-1.5 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                      vos
                    </span>
                  )}
                </span>
              </div>

              {/* Points */}
              <span className="text-sm font-black text-white text-center">
                {entry.totalPoints}
              </span>

              {/* Correct */}
              <span className="text-xs font-semibold text-emerald-600 text-center hidden sm:block">
                {entry.correctPredictions}
              </span>

              {/* Accuracy */}
              <span className="text-xs text-slate-600 text-center hidden sm:block">
                {entry.accuracy !== null ? `${entry.accuracy}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
