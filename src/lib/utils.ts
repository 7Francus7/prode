import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMatchLocked(matchDate: Date | string): boolean {
  return new Date() >= new Date(matchDate);
}

export function formatMatchDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, "EEE, MMM d · HH:mm");
}

export function formatMatchDateShort(date: Date | string): string {
  const d = new Date(date);
  return format(d, "MMM d");
}

export function getFlagEmoji(flagCode: string): string {
  if (flagCode === "gb-eng") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  const chars = flagCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
  return chars.join("");
}

export function getPredictionLabel(prediction: "HOME" | "DRAW" | "AWAY"): string {
  return { HOME: "Local", DRAW: "Empate", AWAY: "Visitante" }[prediction];
}
