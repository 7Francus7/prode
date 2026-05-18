"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  variant?: "home" | "pending";
}

type Phase = "days" | "hours" | "minutes" | "urgent" | "locked";

function getPhase(ms: number): Phase {
  if (ms <= 0) return "locked";
  const h = ms / 3_600_000;
  if (h >= 24) return "days";
  if (h >= 2) return "hours";
  if (h >= 0.5) return "minutes";
  return "urgent";
}

function formatParts(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return { days, hours, minutes, seconds, pad };
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-[22px] font-black tabular-nums leading-none tracking-tight text-white"
      >
        {value}
      </span>
      <span
        className="text-[8px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "rgba(100,116,139,0.55)" }}
      >
        {label}
      </span>
    </div>
  );
}

function Dot() {
  return (
    <span
      className="text-[18px] font-black self-start mt-0.5"
      style={{ color: "rgba(100,116,139,0.3)", lineHeight: 1.2 }}
    >
      :
    </span>
  );
}

export function GlobalLockCountdown({ variant = "home" }: Props) {
  const lockDateISO = process.env.NEXT_PUBLIC_LOCK_DATE;
  const router = useRouter();
  const refreshedRef = useRef(false);

  // null = not yet hydrated (avoids SSR mismatch)
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!lockDateISO) return;

    const target = new Date(lockDateISO).getTime();

    const update = () => {
      const remaining = target - Date.now();
      setMs(remaining);
      if (remaining <= 0 && !refreshedRef.current) {
        refreshedRef.current = true;
        router.refresh(); // re-render server components with globalLocked=true
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockDateISO, router]);

  if (!lockDateISO || ms === null) return null;

  const phase = getPhase(ms);
  const parts = formatParts(Math.max(ms, 0));

  // ── LOCKED state ────────────────────────────────────────────────
  if (phase === "locked") {
    return (
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{
          background: "rgba(30,30,30,0.5)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(148,163,184,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "rgba(148,163,184,0.7)" }}>
            Predicciones cerradas
          </p>
          <p className="text-[11px]" style={{ color: "rgba(100,116,139,0.5)" }}>
            El plazo de predicciones venció
          </p>
        </div>
      </div>
    );
  }

  // ── Colors by phase ──────────────────────────────────────────────
  const isUrgent = phase === "urgent";
  const isSoon = phase === "minutes" || phase === "urgent";

  const accentColor = isUrgent
    ? "rgba(239,68,68,0.9)"
    : isSoon
      ? "rgba(245,158,11,0.9)"
      : "rgba(96,165,250,0.85)";

  const bgColor = isUrgent
    ? "rgba(127,29,29,0.12)"
    : isSoon
      ? "rgba(120,53,15,0.1)"
      : "rgba(37,99,235,0.07)";

  const borderColor = isUrgent
    ? "rgba(239,68,68,0.15)"
    : isSoon
      ? "rgba(245,158,11,0.14)"
      : "rgba(37,99,235,0.12)";

  const iconColor = isUrgent
    ? "rgba(239,68,68,0.7)"
    : isSoon
      ? "rgba(245,158,11,0.7)"
      : "rgba(96,165,250,0.65)";

  // Headline label
  const headline =
    variant === "pending"
      ? isUrgent
        ? "¡Pagá ahora! El plazo cierra en..."
        : "Fecha límite de predicciones"
      : isUrgent
        ? "¡Últimas horas para predecir!"
        : "Predicciones cierran en...";

  return (
    <div
      className={`rounded-2xl px-4 py-4 ${isUrgent ? "animate-urgent-blink" : ""}`}
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: accentColor }}
        >
          {headline}
        </span>
      </div>

      {/* Time units */}
      <div className="flex items-start justify-center gap-2">
        {phase === "days" && (
          <>
            <Unit value={String(parts.days)} label="días" />
            <Dot />
            <Unit value={parts.pad(parts.hours)} label="horas" />
            <Dot />
            <Unit value={parts.pad(parts.minutes)} label="min" />
          </>
        )}
        {phase === "hours" && (
          <>
            <Unit value={parts.pad(parts.hours)} label="horas" />
            <Dot />
            <Unit value={parts.pad(parts.minutes)} label="min" />
            <Dot />
            <Unit value={parts.pad(parts.seconds)} label="seg" />
          </>
        )}
        {(phase === "minutes" || phase === "urgent") && (
          <>
            <Unit value={parts.pad(parts.minutes)} label="min" />
            <Dot />
            <Unit value={parts.pad(parts.seconds)} label="seg" />
          </>
        )}
      </div>

      {variant === "pending" && (
        <p
          className="text-center text-[10px] mt-2 font-medium"
          style={{ color: "rgba(148,163,184,0.4)" }}
        >
          Pagá tu inscripción antes de que cierre el plazo
        </p>
      )}
    </div>
  );
}
