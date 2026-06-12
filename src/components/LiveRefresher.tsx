"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 60_000;
const MAX_WAIT_MS = 12 * 60 * 60 * 1000;

interface LiveRefresherProps {
  hasLive: boolean;
  nextKickoffISO: string | null;
}

/**
 * Refresca los datos del Server Component mientras hay partidos en vivo,
 * y dispara un refresh cuando llega el horario del próximo partido para
 * que la página pase sola de "programado" a "en vivo".
 */
export default function LiveRefresher({ hasLive, nextKickoffISO }: LiveRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasLive) {
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, REFRESH_MS);
      const onVisible = () => {
        if (document.visibilityState === "visible") router.refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }

    if (!nextKickoffISO) return;
    const untilKickoff = new Date(nextKickoffISO).getTime() - Date.now() + 30_000;
    if (untilKickoff > MAX_WAIT_MS) return;

    // Ya arrancó pero el sync todavía no lo marcó LIVE: reintentar cada minuto.
    const wait = untilKickoff <= 0 ? REFRESH_MS : untilKickoff;
    const timeout = setTimeout(() => router.refresh(), wait);
    return () => clearTimeout(timeout);
  }, [hasLive, nextKickoffISO, router]);

  return null;
}
