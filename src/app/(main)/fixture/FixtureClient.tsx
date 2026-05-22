"use client";

import { useEffect, useRef, useState } from "react";
import MatchCard from "@/components/MatchCard";
import GroupStandings from "@/components/GroupStandings";
import { cn, isGlobalPredictionLocked } from "@/lib/utils";
import type { MatchWithTeams, StandingEntry } from "@/types";

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

export default function FixtureClient({
  initialGroup,
  initialMatches,
  initialStandings,
}: {
  initialGroup: string;
  initialMatches: MatchWithTeams[];
  initialStandings: StandingEntry[];
}) {
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isFirstRender = useRef(true);

  const globalLocked = isGlobalPredictionLocked();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeGroup === initialGroup) return;
    }

    setLoading(true);
    setError("");

    fetch(`/api/matches?group=${activeGroup}`)
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data)) {
          setError("No se pudieron cargar los partidos.");
          setMatches([]);
          return;
        }
        setMatches(data);
      })
      .catch(() => {
        setError("No se pudieron cargar los partidos.");
        setMatches([]);
      })
      .finally(() => setLoading(false));
  }, [activeGroup, initialGroup]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Mundial 2026</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Fixture</h1>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {GROUP_TABS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={cn(
              "flex-shrink-0 w-9 h-9 rounded-xl text-xs font-black transition-all border",
              activeGroup === group
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-brand-card text-slate-500 border-brand-border hover:border-slate-600 hover:text-slate-300"
            )}
          >
            {group}
          </button>
        ))}
      </div>

      <GroupStandings
        groupName={activeGroup}
        initialStandings={initialStandings}
        initialGroupName={initialGroup}
      />

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm border border-red-800/30 bg-red-900/10 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => <SkeletonCard key={index} />)}
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
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} isAuthenticated globalLocked={globalLocked} />
          ))}
        </div>
      )}
    </div>
  );
}
