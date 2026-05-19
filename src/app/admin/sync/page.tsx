"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SyncResult } from "@/types";

type RecalcResult = { ok: boolean; usersUpdated: number };
type PushTestResult = { ok?: boolean; error?: string };
type BroadcastResult = { sent: number; failed: number; total: number };

export default function AdminSyncPage() {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [recalcResult, setRecalcResult] = useState<RecalcResult | null>(null);
  const [pushTestResult, setPushTestResult] = useState<PushTestResult | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [loading, setLoading] = useState<"live" | "full" | "recalc" | "pushtest" | "broadcast" | null>(null);
  const [error, setError] = useState("");

  async function runSync(full = false) {
    setLoading(full ? "full" : "live");
    setError("");
    setSyncResult(null);
    setRecalcResult(null);
    try {
      const res = await fetch(`/api/sync${full ? "?full=true" : ""}`, { method: "GET" });
      if (res.status === 403) { setError("Sin permisos"); return; }
      setSyncResult(await res.json());
    } catch {
      setError("Error de red");
    } finally {
      setLoading(null);
    }
  }

  async function runRecalculate() {
    setLoading("recalc");
    setError("");
    setSyncResult(null);
    setRecalcResult(null);
    try {
      const res = await fetch("/api/admin/recalculate", { method: "POST" });
      if (res.status === 403) { setError("Sin permisos"); return; }
      setRecalcResult(await res.json());
    } catch {
      setError("Error de red");
    } finally {
      setLoading(null);
    }
  }

  async function runPushTest() {
    setLoading("pushtest");
    setError("");
    setPushTestResult(null);
    setBroadcastResult(null);
    try {
      const res = await fetch("/api/admin/push/test", { method: "POST" });
      setPushTestResult(await res.json());
    } catch {
      setError("Error de red");
    } finally {
      setLoading(null);
    }
  }

  async function runBroadcast() {
    setLoading("broadcast");
    setError("");
    setPushTestResult(null);
    setBroadcastResult(null);
    try {
      const res = await fetch("/api/admin/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Prode 2026", message: "Recordatorio del admin.", url: "/" }),
      });
      setBroadcastResult(await res.json());
    } catch {
      setError("Error de red");
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Admin</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Sync</h1>
      </div>

      {/* Sync section */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
          Sincronizar resultados
        </p>
        <button
          onClick={() => runSync(false)}
          disabled={busy}
          className={cn(
            "w-full py-3 rounded-xl border text-sm font-bold transition-colors",
            "bg-brand-card border-brand-border text-white hover:bg-brand-card-2 disabled:opacity-50"
          )}
        >
          {loading === "live" ? "Sincronizando..." : "Sync partidos en vivo"}
        </button>
        <button
          onClick={() => runSync(true)}
          disabled={busy}
          className={cn(
            "w-full py-3 rounded-xl border text-sm font-bold transition-colors",
            "bg-amber-500/10 border-amber-800/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
          )}
        >
          {loading === "full" ? "Sincronizando..." : "Sync completo (todos los partidos)"}
        </button>
      </div>

      {/* Recalculate section */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
          Puntos
        </p>
        <button
          onClick={runRecalculate}
          disabled={busy}
          className={cn(
            "w-full py-3 rounded-xl border text-sm font-bold transition-colors",
            "bg-red-500/8 border-red-900/30 text-red-400 hover:bg-red-500/15 disabled:opacity-50"
          )}
        >
          {loading === "recalc" ? "Recalculando..." : "Recalcular todos los puntos"}
        </button>
        <p className="text-[10px] text-slate-700 text-center">
          Borra y recalcula PredictionPoints de todos los partidos terminados
        </p>
      </div>

      {/* Push section */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
          Push Notifications
        </p>
        <button
          onClick={runPushTest}
          disabled={busy}
          className={cn(
            "w-full py-3 rounded-xl border text-sm font-bold transition-colors",
            "bg-brand-card border-brand-border text-white hover:bg-brand-card-2 disabled:opacity-50"
          )}
        >
          {loading === "pushtest" ? "Enviando..." : "Enviar push de prueba (a mí)"}
        </button>
        <button
          onClick={runBroadcast}
          disabled={busy}
          className={cn(
            "w-full py-3 rounded-xl border text-sm font-bold transition-colors",
            "bg-amber-500/10 border-amber-800/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
          )}
        >
          {loading === "broadcast" ? "Enviando..." : "Broadcast a todos los pagos"}
        </button>
        <p className="text-[10px] text-slate-700 text-center">
          El broadcast requiere VAPID keys configuradas en Vercel
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 bg-red-900/20 border border-red-800/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {syncResult && (
        <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-2">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Sync completado</p>
          {[
            { label: "Sincronizados", value: syncResult.synced },
            { label: "Actualizados", value: syncResult.updated },
            { label: "Puntos calculados", value: syncResult.pointsCalculated },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-bold">{row.value}</span>
            </div>
          ))}
          {syncResult.errors.length > 0 && (
            <div className="pt-2 border-t border-brand-border space-y-1">
              <p className="text-[11px] text-red-400 font-semibold">Errores ({syncResult.errors.length})</p>
              {syncResult.errors.map((e, i) => (
                <p key={i} className="text-[11px] text-red-300 pl-2">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {recalcResult && (
        <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/8 p-4">
          <p className="text-sm font-bold text-emerald-400">
            Recalculo completado — {recalcResult.usersUpdated} usuario{recalcResult.usersUpdated !== 1 ? "s" : ""} actualizados
          </p>
        </div>
      )}

      {pushTestResult && (
        <div className={cn(
          "rounded-xl border p-4",
          pushTestResult.ok
            ? "border-emerald-800/30 bg-emerald-900/8"
            : "border-red-800/30 bg-red-900/10"
        )}>
          <p className={cn("text-sm font-bold", pushTestResult.ok ? "text-emerald-400" : "text-red-400")}>
            {pushTestResult.ok ? "Push enviado correctamente" : (pushTestResult.error ?? "Error desconocido")}
          </p>
        </div>
      )}

      {broadcastResult && (
        <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-2">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Broadcast completado</p>
          {[
            { label: "Enviados", value: broadcastResult.sent },
            { label: "Fallidos", value: broadcastResult.failed },
            { label: "Total pagos", value: broadcastResult.total },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-bold">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
