import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const AR_TZ = "America/Argentina/Buenos_Aires";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMatchLocked(matchDate: Date | string): boolean {
  return new Date() >= new Date(matchDate);
}

// Global prediction lock — reads NEXT_PUBLIC_LOCK_DATE (accessible server + client)
export function isGlobalPredictionLocked(): boolean {
  const lockDate = process.env.NEXT_PUBLIC_LOCK_DATE;
  if (!lockDate) return false;
  return new Date() >= new Date(lockDate);
}

export function getGlobalLockDateISO(): string | null {
  return process.env.NEXT_PUBLIC_LOCK_DATE ?? null;
}

export function formatMatchDate(date: Date | string): string {
  const d = new Date(date);
  const weekday = d.toLocaleDateString("es-AR", { weekday: "short", timeZone: AR_TZ });
  const day = d.toLocaleDateString("es-AR", { day: "numeric", timeZone: AR_TZ });
  const month = d.toLocaleDateString("es-AR", { month: "short", timeZone: AR_TZ });
  const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: AR_TZ });
  return `${weekday} ${day} ${month} · ${time} AR`;
}

export function formatMatchDateShort(date: Date | string): string {
  const d = new Date(date);
  const day = d.toLocaleDateString("es-AR", { day: "numeric", timeZone: AR_TZ });
  const month = d.toLocaleDateString("es-AR", { month: "short", timeZone: AR_TZ });
  return `${day} ${month}`;
}

export function getFlagEmoji(flagCode: string): string {
  if (flagCode === "gb-eng") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (flagCode === "gb-sct") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
  const chars = flagCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
  return chars.join("");
}

export function getPredictionLabel(prediction: "HOME" | "DRAW" | "AWAY"): string {
  return { HOME: "Local", DRAW: "Empate", AWAY: "Visitante" }[prediction];
}
