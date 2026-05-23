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

function StatCard({
  eyebrow,
  label,
  value,
}: {
  eyebrow: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="theme-panel rounded-[1.35rem] p-4">
      <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <p className="mt-3 font-display text-[1.8rem] font-bold leading-none text-white">{value}</p>
      <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

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
      if (edit.homeScore !== "") body.homeScore = parseInt(edit.homeScore, 10);
      if (edit.awayScore !== "") body.awayScore = parseInt(edit.awayScore, 10);

      if (edit.homeScore !== "" && (isNaN(parseInt(edit.homeScore, 10)) || parseInt(edit.homeScore, 10) < 0)) {
        setEdit((state) => ({ ...state, saving: false, error: "Score invalido" }));
        return;
      }
      if (edit.awayScore !== "" && (isNaN(parseInt(edit.awayScore, 10)) || parseInt(edit.awayScore, 10) < 0)) {
        setEdit((state) => ({ ...state, saving: false, error: "Score invalido" }));
        return;
      }

      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setEdit((state) => ({ ...state, saving: false, error: data.error ?? "Error" }));
        return;
      }

      const updated = (await response.json()) as MatchWithTeams;
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
    <div className="theme-panel rounded-[1.5rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFlagEmoji(match.homeTeam.flagCode)}</span>
            <p className="text-sm font-bold text-white">{match.homeTeam.code}</p>
            <span className="theme-text-faint text-[0.72rem]">vs</span>
            <p className="text-sm font-bold text-white">{match.awayTeam.code}</p>
            <span className="text-lg">{getFlagEmoji(match.awayTeam.flagCode)}</span>
          </div>
          <p className="theme-text-soft mt-1 text-[0.78rem]">
            {match.group ? match.group.label : match.round} - {formatMatchDate(match.matchDate)}
          </p>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${statusColors[match.status]}`} style={{ background: "var(--app-panel-soft-bg)", border: "1px solid var(--app-border)" }}>
          {match.status}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.homeScore}
            onChange={(event) => setEdit((state) => ({ ...state, homeScore: event.target.value, saved: false }))}
            className="theme-input-surface h-11 w-14 rounded-xl text-center text-sm font-bold"
          />
          <span className="theme-text-faint text-sm font-bold">-</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={edit.awayScore}
            onChange={(event) => setEdit((state) => ({ ...state, awayScore: event.target.value, saved: false }))}
            className="theme-input-surface h-11 w-14 rounded-xl text-center text-sm font-bold"
          />
        </div>

        <select
          value={edit.status}
          onChange={(event) => setEdit((state) => ({ ...state, status: event.target.value as MatchStatus, saved: false }))}
          className={cn("theme-input-surface h-11 rounded-xl px-3 text-[0.8rem] font-semibold sm:min-w-[10rem]", statusColors[edit.status])}
        >
          <option value="SCHEDULED">Programado</option>
          <option value="LIVE">En vivo</option>
          <option value="FINISHED">Terminado</option>
        </select>

        <button
          onClick={save}
          disabled={edit.saving}
          className={cn(
            "h-11 rounded-full px-4 text-[0.78rem] font-semibold transition-colors sm:ml-auto",
            edit.saved
              ? "border border-emerald-500/20 bg-emerald-500/12 text-emerald-300"
              : "border border-blue-500/16 bg-blue-500/12 text-blue-300 hover:bg-blue-500/18",
            edit.saving && "opacity-50"
          )}
        >
          {edit.saving ? "Guardando..." : edit.saved ? "Guardado" : "Guardar cambios"}
        </button>
      </div>

      {edit.error ? <p className="mt-3 text-[0.74rem] text-red-400">{edit.error}</p> : null}
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
    setMatches((await response.json()) as MatchWithTeams[]);
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

  const scheduledCount = matches.filter((match) => match.status === "SCHEDULED").length;
  const liveCount = matches.filter((match) => match.status === "LIVE").length;
  const finishedCount = matches.filter((match) => match.status === "FINISHED").length;

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-5 py-5"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <div
          className="absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.3) 50%, rgba(59,130,246,0) 100%)",
          }}
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[34rem]">
            <p className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
              Admin / partidos
            </p>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-none text-white">
              Control de fixtures y resultados
            </h1>
            <p className="theme-text-muted mt-2 text-[0.92rem] leading-relaxed">
              Edita resultados, cambia estados y controla el avance del grupo sin salir del panel.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-[26rem]">
            <StatCard eyebrow="Grupo" label="Seleccionado" value={activeGroup} />
            <StatCard eyebrow="En vivo" label="Ahora" value={liveCount} />
            <StatCard eyebrow="Cierre" label="Terminados" value={finishedCount} />
          </div>
        </div>
      </section>

      <section className="theme-panel rounded-[1.8rem] p-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Filtros</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {GROUP_TABS.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[0.78rem] font-black transition-colors",
                    activeGroup === group
                      ? "border-blue-500/20 bg-blue-500/14 text-blue-300"
                      : "border-brand-border bg-brand-card text-slate-500 hover:text-white"
                  )}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[0.74rem] font-semibold transition-colors",
                  statusFilter === tab.key
                    ? "border-white/10 bg-white/8 text-white"
                    : "border-transparent text-slate-500 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard eyebrow="Agenda" label="Programados" value={scheduledCount} />
            <StatCard eyebrow="Pulso" label="En vivo" value={liveCount} />
            <StatCard eyebrow="Archivo" label="Terminados" value={finishedCount} />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-36 rounded-[1.5rem] skeleton" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="theme-panel rounded-[1.8rem] px-4 py-12 text-center">
          <p className="text-base font-semibold text-white">Sin partidos para este filtro</p>
          <p className="theme-text-soft mt-2 text-sm">Prueba otro grupo o cambia el estado seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
