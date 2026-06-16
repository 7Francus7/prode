"use client";

import { useEffect, useState } from "react";
import SoccerLoader from "./SoccerLoader";

// Pantalla de bienvenida con la pelota animada. Se muestra una vez por sesión
// (sessionStorage) al iniciar la app, luego se desvanece. Es un overlay: la
// app ya renderiza detrás, así no bloquea la carga.
export default function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("prode-splash") === "1";
    } catch {}

    if (seen) {
      setPhase("gone");
      return;
    }

    try {
      sessionStorage.setItem("prode-splash", "1");
    } catch {}

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 500 : 1500;

    const leave = setTimeout(() => setPhase("leaving"), hold);
    const done = setTimeout(() => setPhase("gone"), hold + 480);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className="splash-screen" data-leaving={phase === "leaving"} aria-hidden="true">
      <div className="flex flex-col items-center gap-7">
        <SoccerLoader size={76} />
        <div className="text-center">
          <p className="font-display text-2xl font-bold tracking-[-0.04em]">
            Prode <span className="text-amber-400">2026</span>
          </p>
          <p className="mt-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Mundial entre amigos
          </p>
        </div>
      </div>
    </div>
  );
}
