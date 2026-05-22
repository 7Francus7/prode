"use client";

import { useMemo, useState } from "react";
import { cn, formatMatchDate, getFlagEmoji } from "@/lib/utils";
import type { PredictionWithMatch } from "@/types";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "correct", label: "Aciertos" },
  { key: "wrong", label: "Errores" },
  { key: "pending", label: "Pendientes" },
] as const;

const PREDICTION_LABEL: Record<string, string> = {
  HOME: "Local",
  DRAW: "Empate",
  AWAY: "Visita",
};

type FilterKey = (typeof FILTERS)[number]["key"];

function filterPredictions(predictions: PredictionWithMatch[], filter: FilterKey) {
  switch (filter) {
    case "correct":
      return predictions.filter((prediction) => prediction.predictionPoints?.correct);
    case "wrong":
      return predictions.filter(
        (prediction) => prediction.predictionPoints != null && !prediction.predictionPoints.correct
      );
    case "pending":
      return predictions.filter((prediction) => prediction.predictionPoints == null);
    default:
      return predictions;
  }
}

export default function PredictionsClient({
  initialPredictions,
}: {
  initialPredictions: PredictionWithMatch[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const stats = useMemo(() => {
    const total = initialPredictions.length;
    const correct = initialPredictions.filter((prediction) => prediction.predictionPoints?.correct).length;
    const wrong = initialPredictions.filter(
      (prediction) => prediction.predictionPoints != null && !prediction.predictionPoints.correct
    ).length;
    const pending = initialPredictions.filter((prediction) => prediction.predictionPoints == null).length;
    const accuracy =
      correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null;

    return { total, correct, wrong, pending, accuracy };
  }, [initialPredictions]);

  const visiblePredictions = useMemo(
    () => filterPredictions(initialPredictions, filter),
    [filter, initialPredictions]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Mi historial</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Predicciones</h1>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Aciertos", value: stats.correct, color: "text-emerald-400" },
          { label: "Errores", value: stats.wrong, color: "text-red-500" },
          { label: "Efectiv.", value: stats.accuracy !== null ? `${stats.accuracy}%` : "—", color: "text-blue-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-brand-card border border-brand-border rounded-2xl px-2 py-3.5 text-center"
          >
            <p className={cn("text-lg font-black leading-none", stat.color)}>{stat.value}</p>
            <p className="text-[9px] text-slate-600 mt-1.5 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats.pending > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p className="text-[11px] text-amber-600 font-medium">
            {stats.pending} predicción{stats.pending !== 1 ? "es" : ""} pendiente{stats.pending !== 1 ? "s" : ""} de resolución
          </p>
        </div>
      )}

      <div className="flex gap-1.5">
        {FILTERS.map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              filter === filterOption.key
                ? "bg-blue-600/15 text-blue-400 border-blue-600/30"
                : "text-slate-500 border-transparent bg-brand-card hover:text-slate-300 hover:border-brand-border"
            )}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {visiblePredictions.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-brand-border bg-brand-card">
          <div className="w-10 h-10 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {filter === "all"
              ? "No hiciste ninguna predicción aún"
              : "Sin predicciones en esta categoría"}
          </p>
          <p className="text-slate-700 text-xs mt-1">
            {filter === "all" ? "Andá al Fixture y empezá a predecir" : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visiblePredictions.map((prediction) => {
            const match = prediction.match;
            const resolved = prediction.predictionPoints != null;
            const isCorrect = prediction.predictionPoints?.correct;

            return (
              <div
                key={prediction.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-brand-card",
                  isCorrect === true && "border-emerald-800/30 bg-emerald-900/5",
                  isCorrect === false && "border-red-900/20",
                  !resolved && "border-brand-border"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border",
                    isCorrect === true && "bg-emerald-500/15 border-emerald-500/20",
                    isCorrect === false && "bg-red-500/8 border-red-900/20",
                    !resolved && "bg-brand-card-2 border-brand-border"
                  )}
                >
                  {isCorrect === true ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : isCorrect === false ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white leading-none mb-1">
                    <span>{getFlagEmoji(match.homeTeam.flagCode)}</span>
                    <span>{match.homeTeam.code}</span>
                    {match.status === "FINISHED" ? (
                      <span className="text-slate-500 font-normal text-xs">
                        {match.homeScore}–{match.awayScore}
                      </span>
                    ) : (
                      <span className="text-slate-700 font-light">·</span>
                    )}
                    <span>{match.awayTeam.code}</span>
                    <span>{getFlagEmoji(match.awayTeam.flagCode)}</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    {formatMatchDate(match.matchDate)}
                    {match.group && ` · ${match.group.label}`}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      prediction.prediction === "HOME" && "bg-blue-900/30 text-blue-500 border border-blue-900/30",
                      prediction.prediction === "DRAW" && "bg-amber-900/20 text-amber-600 border border-amber-900/20",
                      prediction.prediction === "AWAY" && "bg-slate-700/30 text-slate-400 border border-slate-700/30"
                    )}
                  >
                    {PREDICTION_LABEL[prediction.prediction]}
                  </span>
                  {resolved && (
                    <p
                      className={cn(
                        "text-[10px] font-bold mt-1",
                        isCorrect ? "text-emerald-500" : "text-slate-700"
                      )}
                    >
                      {isCorrect
                        ? `+${prediction.predictionPoints!.points} pt${prediction.predictionPoints!.points !== 1 ? "s" : ""}`
                        : "0 pts"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
