"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SyncResult } from "@/types";

type RecalcResult = { ok: boolean; usersUpdated: number };
type PushTestResult = { ok?: boolean; sent?: number; error?: string };
type BroadcastResult = { sent: number; failed: number; total: number; error?: string };

function StatCard({
  eyebrow,
  label,
  value,
}: {
  eyebrow: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="theme-panel rounded-[1.35rem] p-4">
      <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <p className="mt-3 font-display text-[1.8rem] font-bold leading-none text-white">{value}</p>
      <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ActionPanel({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <section className="theme-panel rounded-[1.8rem] p-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      <p className="mt-2 text-base font-semibold text-white">{title}</p>
      <p className="theme-text-soft mt-1 text-[0.82rem] leading-relaxed">{description}</p>
      <div className="mt-4 space-y-2.5">{actions}</div>
    </section>
  );
}

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
      const response = await fetch(`/api/sync${full ? "?full=true" : ""}`, { method: "GET" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data !== "object" || !Array.isArray((data as SyncResult).errors)) {
        setError((data as { error?: string } | null)?.error ?? "No se pudo sincronizar");
        return;
      }
      setSyncResult(data as SyncResult);
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
      const response = await fetch("/api/admin/recalculate", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data !== "object") {
        setError((data as { error?: string } | null)?.error ?? "No se pudo recalcular");
        return;
      }
      setRecalcResult(data as RecalcResult);
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
      const response = await fetch("/api/admin/push/test", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPushTestResult({ error: (data as { error?: string } | null)?.error ?? "No se pudo enviar el push de prueba" });
        return;
      }
      setPushTestResult(data as PushTestResult);
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
      const response = await fetch("/api/admin/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Prode 2026", message: "Recordatorio del admin.", url: "/" }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data !== "object") {
        setError((data as { error?: string } | null)?.error ?? "No se pudo enviar el broadcast");
        return;
      }
      setBroadcastResult(data as BroadcastResult);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-5 py-5"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <div
          className="absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.28) 50%, rgba(16,185,129,0) 100%)",
          }}
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[34rem]">
            <p className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
              Admin / sync
            </p>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-none text-white">
              Operacion y mantenimiento
            </h1>
            <p className="theme-text-muted mt-2 text-[0.92rem] leading-relaxed">
              Ejecuta sync de resultados, recalcula puntos y valida las notificaciones del grupo.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-[26rem]">
            <StatCard eyebrow="Sync" label="Estado" value={loading === "live" || loading === "full" ? "Run" : "OK"} />
            <StatCard eyebrow="Puntos" label="Recalc" value={loading === "recalc" ? "Run" : "Ready"} />
            <StatCard eyebrow="Push" label="Canal" value={loading === "pushtest" || loading === "broadcast" ? "Run" : "Ready"} />
          </div>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-[1.2rem] px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.13)",
            color: "rgba(185,28,28,0.9)",
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <ActionPanel
          eyebrow="Resultados"
          title="Sincronizar partidos"
          description="Actualiza estados y resultados contra la fuente externa."
          actions={
            <>
              <button
                onClick={() => runSync(false)}
                disabled={busy}
                className={cn(
                  "w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                  "border border-blue-500/16 bg-blue-500/12 text-blue-300 hover:bg-blue-500/18 disabled:opacity-50"
                )}
              >
                {loading === "live" ? "Sincronizando..." : "Sync partidos en vivo"}
              </button>
              <button
                onClick={() => runSync(true)}
                disabled={busy}
                className={cn(
                  "w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                  "border border-amber-500/16 bg-amber-500/12 text-amber-300 hover:bg-amber-500/18 disabled:opacity-50"
                )}
              >
                {loading === "full" ? "Sincronizando..." : "Sync completo"}
              </button>
            </>
          }
        />

        <ActionPanel
          eyebrow="Integridad"
          title="Recalcular puntos"
          description="Vuelve a generar PredictionPoints de todos los partidos terminados."
          actions={
            <button
              onClick={runRecalculate}
              disabled={busy}
              className={cn(
                "w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                "border border-red-500/16 bg-red-500/10 text-red-300 hover:bg-red-500/16 disabled:opacity-50"
              )}
            >
              {loading === "recalc" ? "Recalculando..." : "Recalcular todos los puntos"}
            </button>
          }
        />

        <ActionPanel
          eyebrow="Notificaciones"
          title="Push y broadcast"
          description="Prueba el canal propio y luego dispara un recordatorio a jugadores pagos."
          actions={
            <>
              <button
                onClick={runPushTest}
                disabled={busy}
                className={cn(
                  "w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                  "border border-white/10 bg-white/6 text-white hover:bg-white/10 disabled:opacity-50"
                )}
              >
                {loading === "pushtest" ? "Enviando..." : "Push de prueba"}
              </button>
              <button
                onClick={runBroadcast}
                disabled={busy}
                className={cn(
                  "w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                  "border border-amber-500/16 bg-amber-500/12 text-amber-300 hover:bg-amber-500/18 disabled:opacity-50"
                )}
              >
                {loading === "broadcast" ? "Enviando..." : "Broadcast a pagos"}
              </button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {syncResult ? (
          <section className="theme-panel rounded-[1.8rem] p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-400">Sync completado</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Sincronizados", value: syncResult.synced },
                { label: "Actualizados", value: syncResult.updated },
                { label: "Puntos calculados", value: syncResult.pointsCalculated },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="theme-text-soft">{row.label}</span>
                  <span className="font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
            {syncResult.errors.length > 0 ? (
              <div className="mt-4 border-t border-brand-border pt-4">
                <p className="text-[0.72rem] font-semibold text-red-400">Errores ({syncResult.errors.length})</p>
                <div className="mt-2 space-y-1">
                  {syncResult.errors.map((entry, index) => (
                    <p key={index} className="text-[0.74rem] text-red-300">{entry}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {recalcResult ? (
          <section className="theme-panel rounded-[1.8rem] p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-400">Recalculo completado</p>
            <p className="mt-3 text-base font-semibold text-white">
              {recalcResult.usersUpdated} usuario{recalcResult.usersUpdated !== 1 ? "s" : ""} actualizados
            </p>
            <p className="theme-text-soft mt-2 text-sm">
              Los puntos quedaron alineados con los resultados ya cerrados.
            </p>
          </section>
        ) : null}

        {pushTestResult ? (
          <section className="theme-panel rounded-[1.8rem] p-4">
            <p className={cn("text-[0.62rem] font-semibold uppercase tracking-[0.22em]", pushTestResult.ok ? "text-emerald-400" : "text-red-400")}>
              Push de prueba
            </p>
            <p className="mt-3 text-base font-semibold text-white">
              {pushTestResult.ok
                ? `Push enviado correctamente${pushTestResult.sent ? ` (${pushTestResult.sent})` : ""}`
                : pushTestResult.error ?? "Error desconocido"}
            </p>
          </section>
        ) : null}

        {broadcastResult ? (
          <section className="theme-panel rounded-[1.8rem] p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-emerald-400">Broadcast completado</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Enviados", value: broadcastResult.sent },
                { label: "Fallidos", value: broadcastResult.failed },
                { label: "Total pagos", value: broadcastResult.total },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="theme-text-soft">{row.label}</span>
                  <span className="font-semibold text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
