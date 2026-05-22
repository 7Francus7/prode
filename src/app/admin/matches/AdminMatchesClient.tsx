"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn, formatMatchDate, getFlagEmoji } from "@/lib/utils";
import type { MatchWithTeams } from "@/types";
import type { MatchStatus } from "@prisma/client";

const GROUP_TABS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const STATUS_TABS: { key: MatchStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "SCHEDULED", label: "Programados" },
  { key: "LIVE", label: "En vivo" },
  { key: "FINISHED", label: "Terminados" },
];
type EditState = {
  homeScore: string;
  awayScore: string;
  status: MatchStatus;
  saving: boolean;
  saved: boolean;
  error: string;
};

function MatchRow({
  match,
  onSaved,
}: {
  match: MatchWithTeams;
  onSaved: (updated: MatchWithTeams) => void;
}) {
  const [edit, setEdit] = useState<EditState>({
    homeScore: match.homeScore?.toString() ?? "",
    awayScore: match.awayScore?.toString() ?? "",
    status: match.status,
    saving: false,
    saved: false,
    error: "",
  });

  async function save() {
    setEdit((state) => ({ ...state, saving: true, saved: false, error: "" }));
    try {
      const body: Record<string, unknown> = { status: edit.status };
      if (edit.homeScore !== "") body.homeScore = parseInt(edit.homeScore);
      if (edit.awayScore !== "") body.awayScore = parseInt(edit.awayScore);

      if (
        edit.homeScore !== "" &&
        (isNaN(parseInt(edit.homeScore)) || parseInt(edit.homeScore) < 0)
      ) {
        setEdit((state) => ({ ...state, saving: false, error: "Score inválido" }));
        return;
      }
      if (
        edit.awayScore !== "" &&
        (isNaN(parseInt(edit.awayScore)) || parseInt(edit.awayScore) < 0)
      ) {
        setEdit((state) => ({ ...state, saving: false, error: "Score inválido" }));
        return;
      }

      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setEdit((state) => ({ ...state, saving: false, error: data.error ?? "Error" }));
        return;
      }

      const updated = await response.json();
      setEdit((state) => ({ ...state, saving: false, saved: true }));
      onSaved(updated);
      setTimeout(() => setEdit((state) => ({ ...state, saved: false })), 2000);
    } catch {
      setEdit((state) => ({ ...state, saving: false, error: "Error de red" }));
    }
  }

  const statusColors: Record<MatchStatus, string> = {
    SCHEDULED: "text-slate-400",
    LIVE: "text-red-400",
    FINISHED: "text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getFlagEmoji(match.homeTeam.flagCode)}</span>
          <span className="text-[13px] font-black text-white">{match.homeTeam.code}</span>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-600 font-medium">
            {match.group ? match.group.label : match.round}
          </div>
          <div className="text-[11px] text-slate-500">
            {formatMatchDate(match.matchDate)}
          </div>
          {(match.homeScore != null || match.awayScore != null) && (
            <div className="text-[13px] font-black text-slate-400 tabular-nums">
              {match.homeScore ?? "–"} — {match.awayScore ?? "–"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-white">{match.awayTeam.code}</span>
          <span className="text-xl">{getFlagEmoji(match.awayTeam.flagCode)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.homeScore}
            onChange={(event) => setEdit((state) => ({ ...state, homeScore: event.target.value, saved: false }))}
            className="w-12 h-9 rounded-lg bg-brand-card-2 border border-brand-border text-white text-center text-sm font-bold focus:outline-none focus:border-blue-600/50"
          />
          <span className="text-slate-700 text-sm font-bold">—</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.awayScore}
            onChange={(event) => setEdit((state) => ({ ...state, awayScore: event.target.value, saved: false }))}
            className="w-12 h-9 rounded-lg bg-brand-card-2 border border-brand-border text-white text-center text-sm font-bold focus:outline-none focus:border-blue-600/50"
          />
        </div>

        <select
          value={edit.status}
          onChange={(event) =>
            setEdit((state) => ({ ...state, status: event.target.value as MatchStatus, saved: false }))
          }
          className={cn(
            "h-9 rounded-lg bg-brand-card-2 border border-brand-border text-[12px] font-semibold px-2 focus:outline-none focus:border-blue-600/50 flex-1",
            statusColors[edit.status]
          )}
        >
          <option value="SCHEDULED">Programado</option>
          <option value="LIVE">En vivo</option>
          <option value="FINISHED">Terminado</option>
        </select>

        <button
          onClick={save}
          disabled={edit.saving}
          className={cn(
            "h-9 px-4 rounded-lg text-[12px] font-bold transition-colors shrink-0",
            edit.saved
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
              : "bg-blue-600/15 text-blue-400 border border-blue-600/30 hover:bg-blue-600/25",
            edit.saving && "opacity-50"
          )}
        >
          {edit.saving ? "..." : edit.saved ? "✓ Guardado" : "Guardar"}
        </button>
      </div>

      {edit.error && (
        <p className="text-[11px] text-red-400">{edit.error}</p>
      )}
    </div>
  );
}

export default function AdminMatchesClient({
  initialMatches,
}: {
  initialMatches: MatchWithTeams[];
}) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("group", activeGroup);

    const response = await fetch(`/api/admin/matches?${params}`);
    setMatches(await response.json());
    setLoading(false);
  }, [activeGroup, statusFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeGroup === "A" && statusFilter === "ALL") return;
    }

    fetchMatches();
  }, [fetchMatches, activeGroup, statusFilter]);

  const handleSaved = useCallback((updated: MatchWithTeams) => {
    setMatches((prev) => prev.map((match) => (match.id === updated.id ? updated : match)));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Admin</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Partidos</h1>
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

      <div className="flex gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
              statusFilter === tab.key
                ? "bg-brand-card-2 text-white border-brand-border"
                : "text-slate-600 border-transparent hover:text-slate-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-28 rounded-xl skeleton" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-center text-slate-600 py-12 text-sm">Sin partidos</p>
      ) : (
        <div className="space-y-2.5">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
