import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchStatus } from "@prisma/client";

const AR_TZ = "America/Argentina/Buenos_Aires";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMatchLocked(
  matchDate: Date | string,
  status?: MatchStatus,
  now: Date = new Date()
): boolean {
  if (status === "LIVE" || status === "FINISHED") {
    return true;
  }

  return now >= new Date(matchDate);
}

// First match of the World Cup 2026 (opener): 11 Jun 2026, 19:00 UTC.
const WORLD_CUP_FIRST_MATCH_ISO = "2026-06-11T19:00:00Z";

// All predictions close 1 hour before the first match. After this moment no
// prediction can be created or changed — every match locks at the same time.
export const GLOBAL_LOCK_ISO = new Date(
  new Date(WORLD_CUP_FIRST_MATCH_ISO).getTime() - 60 * 60 * 1000,
).toISOString();

function getConfiguredGlobalLockISO(): string {
  return process.env.PRODE_GLOBAL_LOCK_ISO || process.env.NEXT_PUBLIC_PRODE_GLOBAL_LOCK_ISO || GLOBAL_LOCK_ISO;
}

export function isGlobalPredictionLocked(now: Date = new Date()): boolean {
  return now >= new Date(getConfiguredGlobalLockISO());
}

export function getGlobalLockDateISO(): string {
  return getConfiguredGlobalLockISO();
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
