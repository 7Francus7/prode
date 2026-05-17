"use client";

import { useState, useCallback } from "react";
import { cn, isMatchLocked, formatMatchDate, getFlagEmoji } from "@/lib/utils";
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

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? ""}
        className="w-6 h-6 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-6 h-6 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">
      {initials}
    </div>
  );
}

export default function MatchCard({
  match,
  showPrediction = true,
  isAuthenticated = false,
  onPredictionSuccess,
}: MatchCardProps) {
  const [myPrediction, setMyPrediction] = useState<PredictionResult | null>(
    match.myPrediction ?? null
  );
  const [loading, setLoading] = useState<PredictionResult | null>(null);
  const [showPicks, setShowPicks] = useState(false);
  const [picks, setPicks] = useState<PickEntry[] | null>(null);
  const [picksLoading, setPicksLoading] = useState(false);
  const [locked, setLocked] = useState(() => isMatchLocked(match.matchDate));

  const finished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const winner = match.winner as PredictionResult | null;
  const isGroupStage = !!match.groupId;

  const predict = useCallback(
    async (value: PredictionResult) => {
      if (locked || !isAuthenticated || loading) return;
      setLoading(value);
      try {
        const res = await fetch("/api/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId: match.id, prediction: value }),
        });
        if (res.ok) {
          setMyPrediction(value);
          onPredictionSuccess?.(match.id, value);
        }
      } finally {
        setLoading(null);
      }
    },
    [locked, isAuthenticated, loading, match.id, onPredictionSuccess]
  );

  const togglePicks = useCallback(async () => {
    if (!showPicks && picks === null) {
      setPicksLoading(true);
      try {
        const res = await fetch(`/api/matches/${match.id}/picks`);
        if (res.ok) setPicks(await res.json());
        else setPicks([]);
      } finally {
        setPicksLoading(false);
      }
    }
    setShowPicks((v) => !v);
  }, [showPicks, picks, match.id]);

  const homeWon = finished && winner === "HOME";
  const awayWon = finished && winner === "AWAY";
  const isDraw = finished && winner === "DRAW";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-brand-card overflow-hidden",
        isLive
          ? "border-red-800/40 shadow-[0_0_24px_rgba(239,68,68,0.05)]"
          : "border-brand-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.14em]">
          {match.group ? match.group.label : match.round}
        </span>
        <div className="flex items-center gap-2">
          {!isGroupStage && (
            <span className="text-[9px] font-semibold text-slate-600 bg-brand-card-2 border border-brand-border rounded-full px-2 py-0.5 uppercase tracking-wider">
              Sin prode
            </span>
          )}
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Teams + score */}
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center">

          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[40px] leading-none">{getFlagEmoji(match.homeTeam.flagCode)}</span>
            <span
              className={cn(
                "text-[13px] font-black tracking-wide",
                homeWon ? "text-emerald-400" : finished ? "text-slate-600" : "text-white"
              )}
            >
              {match.homeTeam.code}
            </span>
            <span className="text-[10px] text-slate-600 text-center leading-tight line-clamp-1 px-1 w-full">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Center */}
          <div className="flex flex-col items-center gap-1.5 min-w-[84px]">
            {finished || isLive ? (
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "text-[28px] font-black tabular-nums leading-none",
                    homeWon ? "text-emerald-400" : isDraw ? "text-amber-400" : finished ? "text-slate-600" : "text-white"
                  )}
                >
                  {match.homeScore ?? 0}
                </span>
                <span className="text-slate-700 font-light text-xl">—</span>
                <span
                  className={cn(
                    "text-[28px] font-black tabular-nums leading-none",
                    awayWon ? "text-emerald-400" : isDraw ? "text-amber-400" : finished ? "text-slate-600" : "text-white"
                  )}
                >
                  {match.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <span className="text-[22px] font-black text-slate-800 tracking-widest leading-none">vs</span>
            )}
            <span className="text-[10px] text-slate-600 leading-none text-center whitespace-nowrap">
              {formatMatchDate(match.matchDate)}
            </span>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[40px] leading-none">{getFlagEmoji(match.awayTeam.flagCode)}</span>
            <span
              className={cn(
                "text-[13px] font-black tracking-wide",
                awayWon ? "text-emerald-400" : finished ? "text-slate-600" : "text-white"
              )}
            >
              {match.awayTeam.code}
            </span>
            <span className="text-[10px] text-slate-600 text-center leading-tight line-clamp-1 px-1 w-full">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Venue */}
        <p className="text-center text-[10px] text-slate-700 mt-2.5 truncate px-4">
          {match.stadium} · {match.city}
        </p>
      </div>

      {/* Prediction / Knockout section */}
      {showPrediction && (
        <div className="px-3 pb-3 border-t border-brand-border">
          <div className="pt-2.5">
            {!isGroupStage ? (
              <p className="text-center text-[11px] text-slate-700 py-1">
                No participa en el prode
              </p>
            ) : !isAuthenticated ? (
              <p className="text-center text-[11px] text-slate-600 py-1">
                Iniciá sesión para predecir
              </p>
            ) : (
              <>
                {!locked && (
                  <div className="mb-2">
                    <Countdown matchDate={match.matchDate} onLock={() => setLocked(true)} />
                  </div>
                )}
                {locked && !finished && !myPrediction ? (
                  <p className="text-center text-[11px] text-slate-700 py-1 flex items-center justify-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Predicción cerrada
                  </p>
                ) : (
                  <div className="flex gap-1.5">
                    {(["HOME", "DRAW", "AWAY"] as PredictionResult[]).map((val) => (
                      <PredictionButton
                        key={val}
                        label={PREDICTION_LABELS[val](match.homeTeam.code, match.awayTeam.code)}
                        value={val}
                        selected={myPrediction === val}
                        correct={finished && winner === val ? true : undefined}
                        wrong={finished && myPrediction === val && winner !== val ? true : undefined}
                        disabled={locked || !isAuthenticated}
                        loading={loading === val}
                        onClick={() => predict(val)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Picks section — only for group stage matches, only when locked */}
      {isGroupStage && locked && isAuthenticated && (
        <div className="border-t border-brand-border">
          <button
            onClick={togglePicks}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span className="font-semibold uppercase tracking-wider">
              {picksLoading ? "Cargando..." : `Picks${picks ? ` (${picks.length})` : ""}`}
            </span>
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
          </button>

          {showPicks && picks !== null && (
            <div className="px-3 pb-3 space-y-1.5 animate-slide-up">
              {picks.length === 0 ? (
                <p className="text-center text-[11px] text-slate-700 py-2">
                  Nadie predijo este partido
                </p>
              ) : (
                picks.map((pick) => (
                  <div
                    key={pick.userId}
                    className="flex items-center gap-2.5 py-1"
                  >
                    <Avatar name={pick.name} image={pick.image} />
                    <span className="flex-1 text-[12px] text-slate-300 font-medium truncate">
                      {pick.name ?? "Anónimo"}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold border rounded-full px-2 py-0.5 uppercase tracking-wide",
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
                      <span className={cn("text-[13px]", pick.correct ? "text-emerald-400" : "text-red-500")}>
                        {pick.correct ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
