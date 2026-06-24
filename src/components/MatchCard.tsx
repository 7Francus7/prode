"use client";

import { useCallback, useState } from "react";
import { Lock, Users } from "lucide-react";
import { cn, formatMatchDate, getFlagEmoji, getGlobalLockDateISO, isMatchLocked } from "@/lib/utils";
import Countdown from "./Countdown";
import StatusBadge from "./StatusBadge";
import PredictionButton from "./PredictionButton";
import type { MatchWithTeams, PickEntry } from "@/types";
import type { PredictionResult } from "@prisma/client";

interface MatchCardProps {
  match: MatchWithTeams;
  showPrediction?: boolean;
  isAuthenticated?: boolean;
  onPredictionSuccess?: (matchId: string, prediction: PredictionResult) => void;
  globalLocked?: boolean;
}

const PREDICTION_LABELS: Record<PredictionResult, (home: string, away: string) => string> = {
  HOME: (home) => home,
  DRAW: () => "Empate",
  AWAY: (_, away) => away,
};

const PICK_COLORS: Record<PredictionResult, string> = {
  HOME: "bg-blue-600/15 text-blue-400 border-blue-600/25",
  DRAW: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  AWAY: "bg-violet-600/15 text-violet-400 border-violet-600/25",
};

const PICK_GLOW: Record<PredictionResult, string> = {
  HOME: "shadow-[inset_0_1px_0_rgba(96,165,250,0.16),0_10px_24px_-18px_rgba(59,130,246,0.85)]",
  DRAW: "shadow-[inset_0_1px_0_rgba(251,191,36,0.16),0_10px_24px_-18px_rgba(245,158,11,0.8)]",
  AWAY: "shadow-[inset_0_1px_0_rgba(167,139,250,0.16),0_10px_24px_-18px_rgba(124,58,237,0.82)]",
};

const PICK_STRIP: Record<PredictionResult, string> = {
  HOME: "bg-blue-400/80",
  DRAW: "bg-amber-300/80",
  AWAY: "bg-violet-400/80",
};

const OUTCOME_STYLES: Record<PredictionResult, string> = {
  HOME: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  DRAW: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  AWAY: "border-violet-500/30 bg-violet-500/10 text-violet-300",
};

function buildPickBreakdown(picks: PickEntry[] | null) {
  return (picks ?? []).reduce<Record<PredictionResult, number>>(
    (acc, pick) => {
      acc[pick.prediction] += 1;
      return acc;
    },
    { HOME: 0, DRAW: 0, AWAY: 0 }
  );
}

function OutcomeStrip({
  match,
  myPrediction,
  winner,
  finished,
}: {
  match: MatchWithTeams;
  myPrediction: PredictionResult | null;
  winner: PredictionResult | null;
  finished: boolean;
}) {
  const breakdown = match.predictionBreakdown ?? { HOME: 0, DRAW: 0, AWAY: 0 };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          <Lock size={12} />
          Ticket sellado
        </span>
        <span className="text-[10px] font-semibold text-slate-600">
          {myPrediction ? "Tu pick marcado" : "Sin pick cargado"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {(["HOME", "DRAW", "AWAY"] as PredictionResult[]).map((value) => {
          const selected = myPrediction === value;
          const correct = finished && winner === value;
          const wrong = finished && selected && winner !== value;

          return (
            <div
              key={value}
              className={cn(
                "relative min-h-[46px] rounded-xl border px-2 py-2 text-center transition-colors",
                selected ? OUTCOME_STYLES[value] : "border-brand-border/60 bg-black/10 text-slate-600",
                correct && "border-emerald-500/35 bg-emerald-500/12 text-emerald-300",
                wrong && "border-red-500/25 bg-red-500/8 text-red-300"
              )}
            >
              <p className="truncate text-[10px] font-black uppercase tracking-[0.12em]">
                {value === "HOME" ? match.homeTeam.code : value === "AWAY" ? match.awayTeam.code : "Empate"}
              </p>
              <p className="mt-1 inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-500">
                <Users size={11} />
                {breakdown[value]} suman
              </p>
              {selected && (
                <span className="absolute -right-1 -top-1 rounded-full border border-white/10 bg-brand-card px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-amber-300">
                  vos
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? ""}
        className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover shadow-[0_8px_18px_-12px_rgba(255,255,255,0.35)]"
      />
    );
  }

  const initials = (name ?? "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-[10px] font-black text-slate-200 shadow-[0_8px_18px_-12px_rgba(255,255,255,0.3)]">
      {initials}
    </div>
  );
}

export default function MatchCard({
  match,
  showPrediction = true,
  isAuthenticated = false,
  onPredictionSuccess,
  globalLocked = false,
}: MatchCardProps) {
  const [myPrediction, setMyPrediction] = useState<PredictionResult | null>(match.myPrediction ?? null);
  const [loading, setLoading] = useState<PredictionResult | null>(null);
  const [predError, setPredError] = useState<string | null>(null);
  const [showPicks, setShowPicks] = useState(false);
  const [picks, setPicks] = useState<PickEntry[] | null>(null);
  const [picksLoading, setPicksLoading] = useState(false);
  const initiallyLocked =
    globalLocked || match.isLocked === true || isMatchLocked(match.matchDate, match.status);
  const [predictionsClosed, setPredictionsClosed] = useState(initiallyLocked);

  const lockDateISO = getGlobalLockDateISO();
  const matchStarted = isMatchLocked(match.matchDate, match.status);
  const finished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const winner = match.winner as PredictionResult | null;
  const isGroupStage = !!match.groupId;

  const predict = useCallback(
    async (value: PredictionResult) => {
      if (predictionsClosed || !isAuthenticated || loading) return;

      const previousPrediction = myPrediction;
      // Optimista: marcamos la seleccion al instante para que el toque se sienta
      // inmediato; si el guardado falla, revertimos al valor anterior.
      setMyPrediction(value);
      setLoading(value);
      setPredError(null);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);

      try {
        const response = await fetch("/api/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId: match.id, prediction: value }),
        });

        if (response.ok) {
          onPredictionSuccess?.(match.id, value);
        } else {
          setMyPrediction(previousPrediction);
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          const message = body.error ?? "";

          if (response.status === 403 && message.includes("Pago")) {
            setPredError("Tu acceso todavia no esta activo.");
          } else if (response.status === 403 && message.includes("cerrad")) {
            setPredError("Las predicciones ya cerraron.");
          } else if (response.status === 403) {
            setPredError("Este partido ya no acepta predicciones.");
          } else {
            setPredError("No se pudo guardar. Intenta de nuevo.");
          }
        }
      } catch {
        setMyPrediction(previousPrediction);
        setPredError("No se pudo guardar tu prediccion. Intenta de nuevo.");
      } finally {
        setLoading(null);
      }
    },
    [predictionsClosed, isAuthenticated, loading, myPrediction, match.id, onPredictionSuccess]
  );

  const togglePicks = useCallback(async () => {
    if (!showPicks && picks === null) {
      setPicksLoading(true);
      try {
        const response = await fetch(`/api/matches/${match.id}/picks`);
        const data = await response.json().catch(() => null);
        setPicks(response.ok && Array.isArray(data) ? data : []);
      } finally {
        setPicksLoading(false);
      }
    }
    setShowPicks((value) => !value);
  }, [showPicks, picks, match.id]);

  const homeWon = finished && winner === "HOME";
  const awayWon = finished && winner === "AWAY";
  const isDraw = finished && winner === "DRAW";
  const venueLabel = [match.stadium, match.city].filter(Boolean).join(" · ") || "Sede por confirmar";
  const showSealedTicket = predictionsClosed || matchStarted;
  const pickBreakdown = buildPickBreakdown(picks);
  const leadingPick = (["HOME", "DRAW", "AWAY"] as PredictionResult[]).reduce<PredictionResult | null>((leader, value) => {
    if (pickBreakdown[value] === 0) return leader;
    if (!leader || pickBreakdown[value] > pickBreakdown[leader]) return value;
    return leader;
  }, null);
  const leadingPickLabel = leadingPick
    ? leadingPick === "HOME"
      ? match.homeTeam.code
      : leadingPick === "AWAY"
        ? match.awayTeam.code
        : "Empate"
    : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-brand-card",
        isLive
          ? "border-red-800/40 shadow-[0_0_24px_rgba(239,68,68,0.05)]"
          : "border-brand-border"
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {match.group ? match.group.label : match.round}
        </span>
        <div className="flex items-center gap-2">
          {!isGroupStage && (
            <span className="rounded-full border border-brand-border bg-brand-card-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
              Sin prode
            </span>
          )}
          <StatusBadge status={match.status} />
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[40px] leading-none">{getFlagEmoji(match.homeTeam.flagCode)}</span>
            <span
              className={cn(
                "text-[13px] font-black tracking-wide",
                homeWon ? "text-emerald-400" : finished ? "text-slate-600" : "text-white"
              )}
            >
              {match.homeTeam.code}
            </span>
            <span className="w-full px-1 text-center text-[10px] leading-tight text-slate-600 line-clamp-1">
              {match.homeTeam.name}
            </span>
          </div>

          <div className="flex min-w-[84px] flex-col items-center gap-1.5">
            {finished || isLive ? (
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "text-[28px] font-black leading-none tabular-nums",
                    homeWon ? "text-emerald-400" : isDraw ? "text-amber-400" : finished ? "text-slate-600" : "text-white"
                  )}
                >
                  {match.homeScore ?? 0}
                </span>
                <span className="text-xl font-light text-slate-700">-</span>
                <span
                  className={cn(
                    "text-[28px] font-black leading-none tabular-nums",
                    awayWon ? "text-emerald-400" : isDraw ? "text-amber-400" : finished ? "text-slate-600" : "text-white"
                  )}
                >
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <span className="text-[22px] font-black leading-none tracking-widest text-slate-800">vs</span>
            )}
            <span className="whitespace-nowrap text-center text-[10px] leading-none text-slate-600">
              {formatMatchDate(match.matchDate)}
            </span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[40px] leading-none">{getFlagEmoji(match.awayTeam.flagCode)}</span>
            <span
              className={cn(
                "text-[13px] font-black tracking-wide",
                awayWon ? "text-emerald-400" : finished ? "text-slate-600" : "text-white"
              )}
            >
              {match.awayTeam.code}
            </span>
            <span className="w-full px-1 text-center text-[10px] leading-tight text-slate-600 line-clamp-1">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        <p className="mt-2.5 truncate px-4 text-center text-[10px] text-slate-700">
          {venueLabel}
        </p>
      </div>

      {showPrediction && (
        <div className="border-t border-brand-border px-3 pb-3">
          <div className="pt-2.5">
            {!isGroupStage ? (
              <p className="py-1 text-center text-[11px] text-slate-700">
                No participa en el prode
              </p>
            ) : !isAuthenticated ? (
              <p className="py-1 text-center text-[11px] text-slate-600">
                Inicia sesion para predecir
              </p>
            ) : showSealedTicket ? (
              <OutcomeStrip
                match={match}
                myPrediction={myPrediction}
                winner={winner}
                finished={finished}
              />
            ) : (
              <>
                {!predictionsClosed && (
                  <div className="mb-2">
                    <Countdown targetDate={lockDateISO} onLock={() => setPredictionsClosed(true)} />
                  </div>
                )}
                {predictionsClosed && !finished && !myPrediction ? (
                  <p className="flex items-center justify-center gap-1.5 py-1 text-center text-[11px] text-slate-700">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Predicciones cerradas
                  </p>
                ) : (
                  <>
                    <div className="flex gap-1.5">
                      {(["HOME", "DRAW", "AWAY"] as PredictionResult[]).map((value) => (
                        <PredictionButton
                          key={value}
                          label={PREDICTION_LABELS[value](match.homeTeam.code, match.awayTeam.code)}
                          value={value}
                          selected={myPrediction === value}
                          correct={finished && winner === value ? true : undefined}
                          wrong={finished && myPrediction === value && winner !== value ? true : undefined}
                          disabled={predictionsClosed || !isAuthenticated}
                          loading={loading === value}
                          onClick={() => predict(value)}
                        />
                      ))}
                    </div>
                    {predError && (
                      <p className="mt-2 animate-fade-in text-center text-[10px] text-red-400">
                        {predError}
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isGroupStage && isAuthenticated && (
        <div className="border-t border-brand-border bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(17,24,39,0.94),rgba(8,13,29,1))]">
          <button
            onClick={togglePicks}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-[11px] text-slate-400 transition-colors hover:text-slate-100"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-slate-100 shadow-[0_10px_24px_-16px_rgba(59,130,246,0.45)]">
                <Users size={13} />
              </span>
              <div className="min-w-0 text-left">
                <span className="block font-semibold uppercase tracking-[0.22em] text-slate-200">
                  {picksLoading ? "Cargando..." : `Picks${picks ? ` (${picks.length})` : ""}`}
                </span>
                <span className="block truncate pt-0.5 text-[10px] text-slate-500">
                  {leadingPickLabel ? `La mesa se inclina por ${leadingPickLabel}` : "Abri el panel para ver como viene la mesa"}
                </span>
              </div>
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-black/10">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-transform", showPicks ? "rotate-180" : "")}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          {showPicks && picks !== null && (
            <div className="animate-slide-up space-y-3 px-3 pb-3">
              <div className="grid grid-cols-3 gap-2">
                {(["HOME", "DRAW", "AWAY"] as PredictionResult[]).map((value) => {
                  const label = value === "HOME" ? match.homeTeam.code : value === "AWAY" ? match.awayTeam.code : "Emp";
                  return (
                    <div
                      key={value}
                      className={cn(
                        "rounded-[1rem] border px-2 py-2.5 text-center",
                        PICK_COLORS[value],
                        PICK_GLOW[value],
                        pickBreakdown[value] === 0 && "border-white/6 bg-white/[0.03] text-slate-600 shadow-none"
                      )}
                    >
                      <div className={cn("mx-auto mb-2 h-[2px] w-8 rounded-full", pickBreakdown[value] === 0 ? "bg-white/8" : PICK_STRIP[value])} />
                      <p className="text-[9px] font-black uppercase tracking-[0.18em]">{label}</p>
                      <p className="mt-1 text-[1.05rem] font-black tabular-nums">{pickBreakdown[value]}</p>
                    </div>
                  );
                })}
              </div>

              {picks.length === 0 ? (
                <p className="rounded-[1rem] border border-dashed border-white/10 bg-black/10 py-3 text-center text-[11px] text-slate-600">
                  Nadie predijo este partido
                </p>
              ) : (
                <div className="space-y-2">
                  {picks.map((pick) => (
                    <div
                      key={pick.userId}
                      className="relative overflow-hidden rounded-[1rem] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-2.5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.95)]"
                    >
                      <div className={cn("absolute inset-y-2 left-0 w-[3px] rounded-r-full", PICK_STRIP[pick.prediction])} />
                      <div className="flex items-center gap-2.5">
                        <Avatar name={pick.name} image={pick.image} />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-slate-100">
                            {pick.name ?? "Anonimo"}
                          </span>
                          <span className="block pt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            pick confirmado
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                              PICK_COLORS[pick.prediction]
                            )}
                          >
                            {pick.prediction === "HOME"
                              ? match.homeTeam.code
                              : pick.prediction === "AWAY"
                                ? match.awayTeam.code
                                : "Emp"}
                          </span>
                          {finished && pick.correct !== null && (
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-bold",
                                pick.correct
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-red-500/30 bg-red-500/10 text-red-300"
                              )}
                            >
                              {pick.correct ? "✓" : "x"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
