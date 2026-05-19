"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MatchCard from "@/components/MatchCard";
import GroupStandings from "@/components/GroupStandings";
import { cn, isGlobalPredictionLocked } from "@/lib/utils";
import type { MatchWithTeams } from "@/types";

const GROUP_TABS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-brand-border overflow-hidden bg-brand-card">
      <div className="px-4 pt-3.5 pb-0">
        <div className="h-3 w-16 skeleton rounded-md" />
      </div>
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-10 h-10 skeleton rounded-full" />
            <div className="h-3 w-10 skeleton rounded-md" />
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[84px]">
            <div className="h-7 w-16 skeleton rounded-lg" />
            <div className="h-2.5 w-20 skeleton rounded-md" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-10 h-10 skeleton rounded-full" />
            <div className="h-3 w-10 skeleton rounded-md" />
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 border-t border-brand-border pt-2.5">
        <div className="flex gap-1.5">
          <div className="flex-1 h-11 skeleton rounded-xl" />
          <div className="flex-1 h-11 skeleton rounded-xl" />
          <div className="flex-1 h-11 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function FixturePage() {
  const { data: session } = useSession();
  const [activeGroup, setActiveGroup] = useState("A");
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  const globalLocked = isGlobalPredictionLocked();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/matches?group=${activeGroup}`)
      .then((r) => r.json())
      .then((data: MatchWithTeams[]) => setMatches(data))
      .finally(() => setLoading(false));
  }, [activeGroup]);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Mundial 2026</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Fixture</h1>
      </div>

      {/* Group selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {GROUP_TABS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={cn(
              "flex-shrink-0 w-9 h-9 rounded-xl text-xs font-black transition-all border",
              activeGroup === g
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-brand-card text-slate-500 border-brand-border hover:border-slate-600 hover:text-slate-300"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Group standings */}
      <GroupStandings groupName={activeGroup} />

      {/* Matches */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-brand-border bg-brand-card">
          <div className="w-10 h-10 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Sin partidos en Grupo {activeGroup}</p>
          <p className="text-slate-700 text-xs mt-1">Los partidos se cargarán próximamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} isAuthenticated={!!session?.user} globalLocked={globalLocked} />
          ))}
        </div>
      )}
    </div>
  );
}
