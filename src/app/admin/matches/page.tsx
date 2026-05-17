"use client";

import { useState, useEffect, useCallback } from "react";
import { cn, getFlagEmoji, formatMatchDate } from "@/lib/utils";
import type { MatchWithTeams } from "@/types";
import type { MatchStatus } from "@prisma/client";

const GROUP_TABS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const STATUS_TABS: { key: MatchStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "SCHEDULED", label: "Programados" },
  { key: "LIVE", label: "En vivo" },
  { key: "FINISHED", label: "Terminados" },
];
const KNOCKOUT_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-Finals",
  "Semi-Finals",
  "Third Place",
  "Final",
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
    setEdit((e) => ({ ...e, saving: true, saved: false, error: "" }));
    try {
      const body: Record<string, unknown> = { status: edit.status };
      if (edit.homeScore !== "") body.homeScore = parseInt(edit.homeScore);
      if (edit.awayScore !== "") body.awayScore = parseInt(edit.awayScore);

      if (
        edit.homeScore !== "" &&
        (isNaN(parseInt(edit.homeScore)) || parseInt(edit.homeScore) < 0)
      ) {
        setEdit((e) => ({ ...e, saving: false, error: "Score inválido" }));
        return;
      }
      if (
        edit.awayScore !== "" &&
        (isNaN(parseInt(edit.awayScore)) || parseInt(edit.awayScore) < 0)
      ) {
        setEdit((e) => ({ ...e, saving: false, error: "Score inválido" }));
        return;
      }

      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setEdit((e) => ({ ...e, saving: false, error: data.error ?? "Error" }));
        return;
      }

      const updated = await res.json();
      setEdit((e) => ({ ...e, saving: false, saved: true }));
      onSaved(updated);
      setTimeout(() => setEdit((e) => ({ ...e, saved: false })), 2000);
    } catch {
      setEdit((e) => ({ ...e, saving: false, error: "Error de red" }));
    }
  }

  const statusColors: Record<MatchStatus, string> = {
    SCHEDULED: "text-slate-400",
    LIVE: "text-red-400",
    FINISHED: "text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-3.5 space-y-3">
      {/* Teams */}
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

      {/* Edit controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.homeScore}
            onChange={(e) => setEdit((s) => ({ ...s, homeScore: e.target.value, saved: false }))}
            className="w-12 h-9 rounded-lg bg-brand-card-2 border border-brand-border text-white text-center text-sm font-bold focus:outline-none focus:border-blue-600/50"
          />
          <span className="text-slate-700 text-sm font-bold">—</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.awayScore}
            onChange={(e) => setEdit((s) => ({ ...s, awayScore: e.target.value, saved: false }))}
            className="w-12 h-9 rounded-lg bg-brand-card-2 border border-brand-border text-white text-center text-sm font-bold focus:outline-none focus:border-blue-600/50"
          />
        </div>

        <select
          value={edit.status}
          onChange={(e) =>
            setEdit((s) => ({ ...s, status: e.target.value as MatchStatus, saved: false }))
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

export default function AdminMatchesPage() {
  const [phase, setPhase] = useState<"groups" | "knockout">("groups");
  const [activeGroup, setActiveGroup] = useState("A");
  const [activeRound, setActiveRound] = useState(KNOCKOUT_ROUNDS[0]);
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (phase === "groups") params.set("group", activeGroup);
    else params.set("round", activeRound);

    const res = await fetch(`/api/admin/matches?${params}`);
    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    setMatches(await res.json());
    setLoading(false);
  }, [phase, activeGroup, activeRound, statusFilter]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleSaved = useCallback((updated: MatchWithTeams) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  if (forbidden) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 font-semibold">Sin permisos de administrador</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Admin</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Partidos</h1>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1.5">
        {[
          { key: "groups", label: "Grupos" },
          { key: "knockout", label: "Eliminatorias" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setPhase(t.key as "groups" | "knockout")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              phase === t.key
                ? "bg-blue-600/15 text-blue-400 border-blue-600/30"
                : "text-slate-500 border-transparent bg-brand-card hover:text-slate-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Group / Round selector */}
      {phase === "groups" ? (
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
      ) : (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {KNOCKOUT_ROUNDS.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRound(r)}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap",
                activeRound === r
                  ? "bg-blue-600/15 text-blue-400 border-blue-600/30"
                  : "text-slate-500 border-transparent bg-brand-card hover:text-slate-300"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
              statusFilter === t.key
                ? "bg-brand-card-2 text-white border-brand-border"
                : "text-slate-600 border-transparent hover:text-slate-400"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Match list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl skeleton" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <p className="text-center text-slate-600 py-12 text-sm">Sin partidos</p>
      ) : (
        <div className="space-y-2.5">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
