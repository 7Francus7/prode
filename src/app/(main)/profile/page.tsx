"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl bg-brand-dark border border-brand-border px-4 py-3.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-colors";

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
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
        setSaveError(data.error ?? "Error al guardar");
      }
    } catch {
      setSaveError("Error de red. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Cuenta</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Perfil</h1>
      </div>

      {/* Avatar card */}
      <div className="flex flex-col items-center gap-3 py-8 rounded-2xl border border-brand-border bg-brand-card">
        <div className="w-20 h-20 rounded-full bg-brand-card-2 border-2 border-brand-border flex items-center justify-center text-2xl font-black text-slate-400 overflow-hidden">
          {session?.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(session?.user.name)
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-white">{session?.user.name ?? "Anónimo"}</p>
          <p className="text-xs text-slate-600 mt-0.5">{session?.user.email}</p>
        </div>
      </div>

      {/* Edit name */}
      <form
        onSubmit={handleSaveName}
        className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-4"
      >
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Editar nombre
          </p>
          <input
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className={inputCls}
          />
        </div>
        {saveError && (
          <p className="text-xs text-red-400">{saveError}</p>
        )}
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full min-h-[44px] rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-40"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar nombre"}
        </button>
      </form>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full min-h-[44px] rounded-2xl border border-red-900/40 text-red-500/80 active:bg-red-900/15 font-semibold transition-colors text-sm"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
