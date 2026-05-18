"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl bg-brand-dark border border-brand-border px-4 py-3.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-colors";

export function ProfileForm({ initialName }: { initialName: string }) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar");
      }
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-4"
      >
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Editar nombre
        </p>
        <input
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          placeholder="Tu nombre"
          className={inputCls}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full min-h-[44px] rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-40"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar nombre"}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full min-h-[44px] rounded-2xl border border-red-900/40 text-red-500/80 active:bg-red-900/15 font-semibold transition-colors text-sm"
      >
        Cerrar sesión
      </button>
    </>
  );
}
