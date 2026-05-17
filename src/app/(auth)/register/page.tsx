"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full rounded-xl bg-brand-dark border border-brand-border px-4 py-3.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-colors";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Crear cuenta</h2>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-900/15 border border-red-800/30 rounded-xl px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre de usuario"
            required
            className={inputCls}
          />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className={inputCls}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6 caracteres)"
            required
            minLength={6}
            className={inputCls}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-blue-400 font-semibold">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
