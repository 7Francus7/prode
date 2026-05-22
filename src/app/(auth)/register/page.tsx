"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GLASS: React.CSSProperties = {
  background: "var(--app-glass-bg)",
  backdropFilter: "blur(24px) saturate(1.4)",
  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
  border: "1px solid var(--app-glass-border)",
  boxShadow: "var(--app-glass-shadow)",
};

const INPUT: React.CSSProperties = {
  background: "var(--app-input-bg)",
  border: "1px solid var(--app-input-border)",
};

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
        const { signIn } = await import("next-auth/react");
        const loginRes = await signIn("credentials", { email, password, redirect: false });
        if (loginRes?.error) {
          router.push("/login");
        } else {
          router.push("/pending");
        }
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] p-7 space-y-5" style={GLASS}>
        <div className="space-y-1.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Primer paso
          </p>
          <h2 className="font-display text-[1.6rem] font-bold tracking-[-0.05em] text-white">
            Crear cuenta
          </h2>
          <p className="text-sm text-slate-400">
            Registra tu usuario y deja lista tu entrada al grupo.
          </p>
        </div>

        {error && (
          <div
            className="relative overflow-hidden rounded-2xl px-4 py-3.5"
            style={{
              background: "rgba(127,29,29,0.14)",
              border: "1px solid rgba(239,68,68,0.13)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0 w-[3px] rounded-r"
              style={{ background: "rgba(239,68,68,0.4)" }}
            />
            <p className="pl-3 text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] theme-text"
            style={INPUT}
          />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] theme-text"
            style={INPUT}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena (min. 6 caracteres)"
            required
            minLength={6}
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] theme-text"
            style={INPUT}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-[14px] text-[15px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #d6a44a 0%, #8f5c1f 100%)",
              boxShadow: "0 16px 26px -18px rgba(214,164,74,0.8)",
            }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500">
        Ya tenes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-200 transition-colors hover:text-white"
        >
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
