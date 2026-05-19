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
    if (perm === "denied") { setState("denied"); return; }

    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? "granted" : "default");
      })
    ).catch(() => setState("default"));
  }, []);

  async function subscribe() {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }

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
        const data = await res.json().catch(() => ({})) as { error?: string };
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
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-brand-border bg-brand-card">
        <div className="w-8 h-8 rounded-xl bg-slate-800/50 border border-brand-border flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-slate-500">Notificaciones bloqueadas</p>
          <p className="text-[10px] text-slate-700 mt-0.5">Activalas desde la configuración del navegador</p>
        </div>
      </div>
    );
  }

  if (state === "granted") {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-800/30 bg-emerald-900/8">
        <div className="w-8 h-8 rounded-xl bg-emerald-600/15 border border-emerald-700/20 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-emerald-400">Notificaciones activas</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Te avisamos cuando termine cada partido</p>
        </div>
        <button
          onClick={unsubscribe}
          disabled={actionLoading}
          className="text-[10px] font-semibold text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          {actionLoading ? "..." : "Desactivar"}
        </button>
      </div>
    );
  }

  // state === "default"
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-brand-border bg-brand-card">
      <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-white">Activar recordatorios</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Resultados y puntos al instante</p>
        {errorMsg && (
          <p className="text-[10px] text-red-400 mt-1">{errorMsg}</p>
        )}
      </div>
      <button
        onClick={subscribe}
        disabled={actionLoading}
        className={cn(
          "flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors",
          "bg-blue-600/15 border-blue-600/25 text-blue-400 hover:bg-blue-600/25 disabled:opacity-40"
        )}
      >
        {actionLoading ? "..." : "Activar"}
      </button>
    </div>
  );
}
