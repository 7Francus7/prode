"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const inputCls =
  "w-full rounded-2xl border border-white/7 bg-black/20 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/25";

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
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-[1.8rem] border border-white/6 bg-black/10 p-5"
      >
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Identidad
          </p>
          <p className="mt-1 font-display text-[1.25rem] font-bold text-white">
            Editar nombre
          </p>
        </div>

        <input
          type="text"
          autoComplete="name"
          autoCapitalize="words"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder="Tu nombre"
          className={inputCls}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full min-h-[46px] rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #d6a44a 0%, #8f5c1f 100%)",
            boxShadow: "0 16px 26px -18px rgba(214,164,74,0.8)",
          }}
        >
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar nombre"}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full min-h-[46px] rounded-[1.4rem] border border-red-900/35 text-sm font-semibold text-red-300/80 transition-colors hover:bg-red-900/10 hover:text-red-200"
      >
        Cerrar sesion
      </button>
    </>
  );
}
