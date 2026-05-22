"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type PushState = "unsupported" | "loading" | "default" | "pending" | "granted" | "denied";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export default function PushNotificationCard() {
  const [state, setState] = useState<PushState>("loading");
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") {
      setState("denied");
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription().then((sub) => setState(sub ? "granted" : "default")))
      .catch(() => setState("default"));
  }, []);

  async function subscribe() {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON() as {
        endpoint: string;
        keys?: { p256dh: string; auth: string };
      };

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        setState("granted");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(data.error ?? "No se pudo guardar la suscripción.");
      }
    } catch {
      setErrorMsg("No se pudo activar. Intentá de nuevo.");
    } finally {
      setActionLoading(false);
    }
  }

  async function unsubscribe() {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("default");
    } catch {
      setErrorMsg("No se pudo desactivar. Intentá de nuevo.");
    } finally {
      setActionLoading(false);
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div
        className="flex items-center gap-3 rounded-[1.6rem] border px-4 py-4"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/6 bg-white/5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white">Notificaciones bloqueadas</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Activálas desde la configuración del navegador</p>
        </div>
      </div>
    );
  }

  if (state === "granted") {
    return (
      <div
        className="flex items-center gap-3 rounded-[1.6rem] border px-4 py-4"
        style={{
          background: "linear-gradient(180deg, rgba(10,28,24,0.9) 0%, rgba(7,16,16,0.92) 100%)",
          borderColor: "rgba(16,185,129,0.12)",
        }}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-emerald-300">Notificaciones activas</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Te avisamos cuando termine cada partido</p>
        </div>
        <button
          onClick={unsubscribe}
          disabled={actionLoading}
          className="flex-shrink-0 text-[10px] font-semibold text-slate-400 transition-colors hover:text-white disabled:opacity-40"
        >
          {actionLoading ? "..." : "Desactivar"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-[1.6rem] border px-4 py-4"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold text-white">Activar recordatorios</p>
        <p className="mt-0.5 text-[10px] text-slate-400">Resultados y puntos al instante</p>
        {errorMsg && <p className="mt-1 text-[10px] text-red-400">{errorMsg}</p>}
      </div>
      <button
        onClick={subscribe}
        disabled={actionLoading}
        className={cn(
          "flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
          "border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15 disabled:opacity-40"
        )}
      >
        {actionLoading ? "..." : "Activar"}
      </button>
    </div>
  );
}
