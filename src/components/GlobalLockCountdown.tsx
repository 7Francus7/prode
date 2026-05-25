"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getGlobalLockDateISO } from "@/lib/utils";

interface Props {
  variant?: "home" | "pending";
}

type Phase = "days" | "hours" | "minutes" | "urgent" | "locked";

function getPhase(ms: number): Phase {
  if (ms <= 0) return "locked";
  const hours = ms / 3_600_000;
  if (hours >= 24) return "days";
  if (hours >= 2) return "hours";
  if (hours >= 0.5) return "minutes";
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
    <div className="flex min-w-[3.8rem] flex-col items-center gap-1">
      <span className="font-display text-[28px] font-bold tabular-nums leading-none tracking-[-0.06em] text-white">
        {value}
      </span>
      <span className="theme-text-faint text-[8px] font-semibold uppercase tracking-[0.16em]">
        {label}
      </span>
    </div>
  );
}

function Dot() {
  return (
    <span className="theme-text-faint mt-1 text-[18px] font-black leading-none opacity-60">
      :
    </span>
  );
}

export function GlobalLockCountdown({ variant = "home" }: Props) {
  const lockDateISO = getGlobalLockDateISO();
  const router = useRouter();
  const refreshedRef = useRef(false);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(lockDateISO).getTime();

    const update = () => {
      const remaining = target - Date.now();
      setMs(remaining);
      if (remaining <= 0 && !refreshedRef.current) {
        refreshedRef.current = true;
        router.refresh();
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockDateISO, router]);

  if (ms === null) return null;

  const phase = getPhase(ms);
  const parts = formatParts(Math.max(ms, 0));

  if (phase === "locked") {
    return (
      <div className="theme-panel flex items-center gap-3 rounded-[1.6rem] px-4 py-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{ background: "var(--app-panel-soft-bg)" }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(148,163,184,0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="theme-text text-sm font-bold">Predicciones cerradas</p>
          <p className="theme-text-faint text-[11px]">
            El plazo global ya vencio
          </p>
        </div>
      </div>
    );
  }

  const isUrgent = phase === "urgent";
  const isSoon = phase === "minutes" || phase === "urgent";

  const accentColor = isUrgent
    ? "rgba(239,68,68,0.9)"
    : isSoon
      ? "rgba(245,158,11,0.9)"
      : "rgba(96,165,250,0.88)";

  const bgColor = isUrgent
    ? "rgba(127,29,29,0.14)"
    : isSoon
      ? "rgba(120,53,15,0.12)"
      : "rgba(37,99,235,0.08)";

  const borderColor = isUrgent
    ? "rgba(239,68,68,0.15)"
    : isSoon
      ? "rgba(245,158,11,0.16)"
      : "rgba(37,99,235,0.12)";

  const iconColor = isUrgent
    ? "rgba(239,68,68,0.76)"
    : isSoon
      ? "rgba(245,158,11,0.76)"
      : "rgba(96,165,250,0.72)";

  const headline =
    variant === "pending"
      ? isUrgent
        ? "Paga ahora: el plazo cierra en"
        : "Fecha limite de predicciones"
      : isUrgent
        ? "Ultimas horas para predecir"
        : "Predicciones cierran en";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.7rem] px-4 py-4 ${isUrgent ? "animate-urgent-blink" : ""}`}
      style={{
        background: `linear-gradient(180deg, ${bgColor} 0%, var(--app-panel-subtle-bg) 100%)`,
        border: `1px solid ${borderColor}`,
        boxShadow: "var(--app-panel-shadow)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)` }}
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
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
            className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
            style={{ color: accentColor }}
          >
            {headline}
          </span>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: accentColor,
            background: "rgba(255,255,255,0.4)",
            border: `1px solid ${borderColor}`,
          }}
        >
          Cierre global
        </span>
      </div>

      <div className="flex items-start justify-center gap-2">
        {phase === "days" && (
          <>
            <Unit value={String(parts.days)} label="dias" />
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

      <p className="theme-text-faint mt-4 text-center text-[0.72rem]">
        Todas las predicciones cierran 1 h antes del primer partido del Mundial.
      </p>
    </div>
  );
}
