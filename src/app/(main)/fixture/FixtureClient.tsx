"use client";

import { useEffect, useRef, useState } from "react";
import MatchCard from "@/components/MatchCard";
import GroupStandings from "@/components/GroupStandings";
import { cn } from "@/lib/utils";
import type { MatchWithTeams, StandingEntry } from "@/types";

const GROUP_TABS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
      <div className="px-4 pt-3.5 pb-0">
        <div className="h-3 w-16 rounded-md skeleton" />
      </div>
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full skeleton" />
            <div className="h-3 w-10 rounded-md skeleton" />
          </div>
          <div className="flex min-w-[84px] flex-col items-center gap-2">
            <div className="h-7 w-16 rounded-lg skeleton" />
            <div className="h-2.5 w-20 rounded-md skeleton" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full skeleton" />
            <div className="h-3 w-10 rounded-md skeleton" />
          </div>
        </div>
      </div>
      <div className="border-t border-brand-border px-3 pt-2.5 pb-3">
        <div className="flex gap-1.5">
          <div className="h-11 flex-1 rounded-xl skeleton" />
          <div className="h-11 flex-1 rounded-xl skeleton" />
          <div className="h-11 flex-1 rounded-xl skeleton" />
        </div>
      </div>
    </div>
  );
}

export default function FixtureClient({
  initialGroup,
  initialMatches,
  initialStandings,
  initialGlobalLocked,
}: {
  initialGroup: string;
  initialMatches: MatchWithTeams[];
  initialStandings: StandingEntry[];
  initialGlobalLocked: boolean;
}) {
  const [activeGroup, setActiveGroup] = useState(initialGroup);
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isFirstRender = useRef(true);

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

  // Mientras haya un partido en vivo (o uno que ya debería haber arrancado)
  // en el grupo activo, refrescar el marcador cada minuto.
  const hasLiveMatch = matches.some((match) => {
    if (match.status === "LIVE") return true;
    if (match.status !== "SCHEDULED") return false;
    const kickoff = new Date(match.matchDate).getTime();
    return kickoff <= Date.now() && Date.now() - kickoff < 3 * 60 * 60 * 1000;
  });

  useEffect(() => {
    if (!hasLiveMatch) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/matches?group=${activeGroup}`)
        .then(async (response) => {
          const data = await response.json().catch(() => null);
          if (response.ok && Array.isArray(data)) setMatches(data);
        })
        .catch(() => {});
    }, 60_000);

    return () => clearInterval(interval);
  }, [hasLiveMatch, activeGroup]);

  return (
    <div className="space-y-5">
      <section
        className="rounded-[1.9rem] border px-4 py-5"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Fase de grupos
        </p>
        <h1 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-white">
          Fixture
        </h1>
        <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-slate-400">
          Cambia de grupo, revisa posiciones y deja tus picks desde una sola vista.
        </p>

        <div className="mt-5 grid grid-cols-6 gap-1.5">
          {GROUP_TABS.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-2xl border text-xs font-bold transition-all active:scale-[0.94]",
                activeGroup === group
                  ? "text-white"
                  : "bg-black/10 text-slate-500 hover:border-slate-600 hover:text-slate-300"
              )}
              style={
                activeGroup === group
                  ? {
                      background: "rgba(214,164,74,0.14)",
                      borderColor: "rgba(214,164,74,0.22)",
                    }
                  : { borderColor: "rgba(255,255,255,0.06)" }
              }
            >
              {group}
            </button>
          ))}
        </div>
      </section>

      <GroupStandings
        groupName={activeGroup}
        initialStandings={initialStandings}
        initialGroupName={initialGroup}
      />

      {error && (
        <div className="rounded-xl border border-red-800/30 bg-red-900/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/6 bg-white/3 px-4 py-14 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/7 bg-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="font-display text-[1.2rem] font-bold text-white">Sin partidos en Grupo {activeGroup}</p>
          <p className="mt-2 text-sm text-slate-400">Los partidos se cargaran proximamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} isAuthenticated globalLocked={initialGlobalLocked} />
          ))}
        </div>
      )}
    </div>
  );
}
