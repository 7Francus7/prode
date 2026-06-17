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
    <div className="overflow-hidden rounded-[1.8rem] border border-white/6 bg-black/10">
      <div className="grid grid-cols-[2rem_1fr_3.5rem_3rem_3rem] items-center border-b border-white/6 bg-white/[0.03] px-4 py-3">
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">#</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Jugador</span>
        <span className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pts</span>
        <span className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Hoy</span>
        <span className="hidden text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:block">%</span>
      </div>

      <div className="divide-y divide-white/6">
        {entries.map((entry, i) => {
          const rank = entry.rank ?? startFrom + i;
          const isMe = entry.id === currentUserId;

          return (
            <div
              key={entry.id}
              className={cn(
                "grid grid-cols-[2rem_1fr_3.5rem_3rem_3rem] items-center px-4 py-3.5 transition-colors",
                isMe ? "bg-amber-400/[0.06]" : "[@media(hover:hover)]:hover:bg-white/[0.02]"
              )}
            >
              <span className="text-xs font-bold">
                {rank <= 3 ? <span>{MEDAL[rank - 1]}</span> : <span className="font-mono text-slate-500">{rank}</span>}
              </span>

              <div className="flex min-w-0 items-center gap-2.5">
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name ?? ""}
                    className="h-8 w-8 flex-shrink-0 rounded-full border border-white/8 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/7 bg-white/5 text-[10px] font-bold text-slate-300">
                    {getInitials(entry.name)}
                  </div>
                )}
                <span className={cn("truncate text-sm font-semibold", isMe ? "text-amber-100" : "text-white")}>
                  {entry.name ?? "Anonimo"}
                  {isMe && (
                    <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-300/70">
                      vos
                    </span>
                  )}
                </span>
              </div>

              <span className="text-center font-display text-[1.05rem] font-bold text-white">
                {entry.totalPoints}
              </span>

              <span className={cn(
                "text-center text-xs font-semibold",
                (entry.todayPoints ?? 0) > 0 ? "text-emerald-300" : "text-slate-700"
              )}>
                {(entry.todayPoints ?? 0) > 0 ? `+${entry.todayPoints}` : "="}
              </span>

              <span className="hidden text-center text-xs text-slate-400 sm:block">
                {entry.accuracy !== null ? `${entry.accuracy}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
