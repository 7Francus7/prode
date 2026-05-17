"use client";

import { useState } from "react";
import type { SyncResult } from "@/types";

export default function AdminSyncPage() {
  const [result, setResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSync(full = false) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/sync${full ? "?full=true" : ""}`, { method: "GET" });
      if (res.status === 403) {
        setError("No tenés permisos de administrador");
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-black text-white">⚙️ Admin — Sync</h1>

      <div className="space-y-3">
        <button
          onClick={() => runSync(false)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-card border border-brand-border text-white font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {loading ? "Sincronizando..." : "🔄 Sync partidos en vivo"}
        </button>
        <button
          onClick={() => runSync(true)}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-800/50 text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          🌐 Sync completo (todos los partidos)
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-2 font-mono text-sm">
          <p className="text-green-400">✓ Sync completado</p>
          <p className="text-gray-400">Sincronizados: <span className="text-white">{result.synced}</span></p>
          <p className="text-gray-400">Actualizados: <span className="text-white">{result.updated}</span></p>
          <p className="text-gray-400">Puntos calculados: <span className="text-white">{result.pointsCalculated}</span></p>
          {result.errors.length > 0 && (
            <div>
              <p className="text-red-400">Errores ({result.errors.length}):</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-red-300 text-xs pl-2">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
