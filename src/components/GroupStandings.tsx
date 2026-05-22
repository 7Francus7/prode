"use client";

import { useEffect, useRef, useState } from "react";
import { cn, getFlagEmoji } from "@/lib/utils";
import type { StandingEntry } from "@/types";

interface GroupStandingsProps {
  groupName: string;
  initialStandings?: StandingEntry[];
  initialGroupName?: string;
}

export default function GroupStandings({
  groupName,
  initialStandings,
  initialGroupName,
}: GroupStandingsProps) {
  const [standings, setStandings] = useState<StandingEntry[] | null>(initialStandings ?? null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (initialStandings && initialGroupName === groupName) return;
    }

    setStandings(null);

    fetch(`/api/groups/${groupName}/standings`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data)) {
          setStandings([]);
          return;
        }
        setStandings(data);
      })
      .catch(() => setStandings([]));
  }, [groupName, initialGroupName, initialStandings]);

  if (standings === null) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-brand-border bg-black/10">
          <div className="h-3 w-24 skeleton rounded" />
        </div>
        <div className="divide-y divide-brand-border">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-2.5">
              <div className="h-3 w-4 skeleton rounded" />
              <div className="h-6 w-6 skeleton rounded-full" />
              <div className="h-3 flex-1 skeleton rounded" />
              <div className="h-3 w-24 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasResults = standings.some((standing) => standing.mp > 0);

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-border bg-black/10">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em]">
          Posiciones · Grupo {groupName}
        </span>
        <div className="flex gap-3 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
          <span className="w-6 text-center">MP</span>
          <span className="w-5 text-center hidden sm:block">W</span>
          <span className="w-5 text-center hidden sm:block">D</span>
          <span className="w-5 text-center hidden sm:block">L</span>
          <span className="w-7 text-center">GD</span>
          <span className="w-5 text-center">P</span>
        </div>
      </div>

      <div className="divide-y divide-brand-border">
        {standings.map((standing, index) => {
          const qualifies = index < 2;

          return (
            <div key={standing.team.id}>
              {index === 2 && hasResults && (
                <div className="flex items-center gap-2 px-4 py-0">
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-[8px] text-slate-700 font-semibold uppercase tracking-widest whitespace-nowrap">
                    fuera
                  </span>
                  <div className="flex-1 h-px bg-brand-border" />
                </div>
              )}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors",
                  qualifies && hasResults ? "bg-emerald-900/[0.07]" : ""
                )}
              >
                <span
                  className={cn(
                    "w-4 text-[11px] font-black text-center shrink-0",
                    qualifies && hasResults ? "text-emerald-500" : "text-slate-600"
                  )}
                >
                  {index + 1}
                </span>

                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[22px] leading-none shrink-0">{getFlagEmoji(standing.team.flagCode)}</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-white leading-none">{standing.team.code}</p>
                    <p className="text-[9px] text-slate-600 truncate leading-none mt-0.5">{standing.team.name}</p>
                  </div>
                </div>

                <div className="flex gap-3 text-[11px] shrink-0">
                  <span className="w-6 text-center font-semibold text-slate-500">{standing.mp}</span>
                  <span className="w-5 text-center font-semibold text-emerald-600 hidden sm:block">{standing.w}</span>
                  <span className="w-5 text-center font-semibold text-amber-600 hidden sm:block">{standing.d}</span>
                  <span className="w-5 text-center font-semibold text-red-800 hidden sm:block">{standing.l}</span>
                  <span
                    className={cn(
                      "w-7 text-center font-bold",
                      standing.gd > 0 ? "text-emerald-500" : standing.gd < 0 ? "text-red-500" : "text-slate-500"
                    )}
                  >
                    {standing.gd > 0 ? `+${standing.gd}` : standing.gd}
                  </span>
                  <span className="w-5 text-center font-black text-white">{standing.pts}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
