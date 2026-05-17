"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Urgency = "normal" | "soon" | "urgent";

function formatDiff(ms: number): { text: string; urgency: Urgency } | null {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return { text: `Cierra en ${d}d ${rh}h`, urgency: "normal" };
  }
  if (h >= 1) return { text: `Cierra en ${h}h ${m}m`, urgency: "normal" };
  if (m >= 15) return { text: `Cierra en ${m}m ${pad(s)}s`, urgency: "soon" };
  return { text: `Últimos ${m}m ${pad(s)}s`, urgency: "urgent" };
}

interface CountdownProps {
  matchDate: Date | string;
  onLock?: () => void;
}

export default function Countdown({ matchDate, onLock }: CountdownProps) {
  const target = new Date(matchDate).getTime();
  const [diff, setDiff] = useState(() => target - Date.now());
  const lockedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const d = target - Date.now();
      setDiff(d);
      if (d <= 0 && !lockedRef.current) {
        lockedRef.current = true;
        onLock?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onLock]);

  const result = formatDiff(diff);
  if (!result) return null;

  const { text, urgency } = result;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 text-[11px] font-semibold",
        urgency === "normal" && "text-slate-500",
        urgency === "soon"   && "text-amber-500",
        urgency === "urgent" && "text-red-500 animate-urgent-blink"
      )}
    >
      <svg
        width="10" height="10" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {text}
    </div>
  );
}
