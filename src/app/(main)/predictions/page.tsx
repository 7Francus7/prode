"use client";

import { useState, useEffect } from "react";
import { cn, getFlagEmoji, formatMatchDate } from "@/lib/utils";
import type { PredictionWithMatch } from "@/types";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "correct", label: "Aciertos" },
  { key: "wrong", label: "Errores" },
  { key: "pending", label: "Pendientes" },
];

const PREDICTION_LABEL: Record<string, string> = {
  HOME: "Local",
  DRAW: "Empate",
  AWAY: "Visita",
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-brand-border bg-brand-card">
      <div className="w-8 h-8 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-36 skeleton rounded-md" />
        <div className="h-2.5 w-24 skeleton rounded-md" />
      </div>
      <div className="h-6 w-14 skeleton rounded-lg" />
    </div>
  );
}

export default function PredictionsPage() {
  const [filter, setFilter] = useState("all");
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/predictions?filter=${filter}`)
      .then((r) => r.json())
      .then(setPredictions)
      .finally(() => setLoading(false));
  }, [filter]);

  const total = predictions.length;
  const correct = predictions.filter((p) => p.predictionPoints?.correct).length;
  const wrong = predictions.filter(
    (p) => p.predictionPoints != null && !p.predictionPoints.correct
  ).length;
  const pending = predictions.filter((p) => p.predictionPoints == null).length;
  const accuracy = (correct + wrong) > 0 ? Math.round((correct / (correct + wrong)) * 100) : null;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Mi historial</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Predicciones</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: total, color: "text-white" },
          { label: "Aciertos", value: correct, color: "text-emerald-400" },
          { label: "Errores", value: wrong, color: "text-red-500" },
          { label: "Efectiv.", value: accuracy !== null ? `${accuracy}%` : "—", color: "text-blue-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-brand-card border border-brand-border rounded-2xl px-2 py-3.5 text-center"
          >
            <p className={cn("text-lg font-black leading-none", s.color)}>{s.value}</p>
            <p className="text-[9px] text-slate-600 mt-1.5 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending notice */}
      {pending > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p className="text-[11px] text-amber-600 font-medium">
            {pending} predicción{pending !== 1 ? "es" : ""} pendiente{pending !== 1 ? "s" : ""} de resolución
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              filter === f.key
                ? "bg-blue-600/15 text-blue-400 border-blue-600/30"
                : "text-slate-500 border-transparent bg-brand-card hover:text-slate-300 hover:border-brand-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : predictions.length === 0 ? (
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
          {predictions.map((p) => {
            const m = p.match;
            const resolved = p.predictionPoints != null;
            const isCorrect = p.predictionPoints?.correct;

            return (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-brand-card",
                  isCorrect === true && "border-emerald-800/30 bg-emerald-900/5",
                  isCorrect === false && "border-red-900/20",
                  !resolved && "border-brand-border"
                )}
              >
                {/* Result icon */}
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

                {/* Match info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white leading-none mb-1">
                    <span>{getFlagEmoji(m.homeTeam.flagCode)}</span>
                    <span>{m.homeTeam.code}</span>
                    {m.status === "FINISHED" ? (
                      <span className="text-slate-500 font-normal text-xs">
                        {m.homeScore}–{m.awayScore}
                      </span>
                    ) : (
                      <span className="text-slate-700 font-light">·</span>
                    )}
                    <span>{m.awayTeam.code}</span>
                    <span>{getFlagEmoji(m.awayTeam.flagCode)}</span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    {formatMatchDate(m.matchDate)}
                    {m.group && ` · ${m.group.label}`}
                  </p>
                </div>

                {/* Prediction badge + points */}
                <div className="flex-shrink-0 text-right">
                  <span
                    className={cn(
                      "inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                      p.prediction === "HOME" && "bg-blue-900/30 text-blue-500 border border-blue-900/30",
                      p.prediction === "DRAW" && "bg-amber-900/20 text-amber-600 border border-amber-900/20",
                      p.prediction === "AWAY" && "bg-slate-700/30 text-slate-400 border border-slate-700/30"
                    )}
                  >
                    {PREDICTION_LABEL[p.prediction]}
                  </span>
                  {resolved && (
                    <p
                      className={cn(
                        "text-[10px] font-bold mt-1",
                        isCorrect ? "text-emerald-500" : "text-slate-700"
                      )}
                    >
                      {isCorrect
                        ? `+${p.predictionPoints!.points} pt${p.predictionPoints!.points !== 1 ? "s" : ""}`
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
