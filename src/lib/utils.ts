import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  return format(d, "EEE d MMM · HH:mm", { locale: es });
}

export function formatMatchDateShort(date: Date | string): string {
  const d = new Date(date);
  return format(d, "d MMM", { locale: es });
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
