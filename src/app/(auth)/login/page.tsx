"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GLASS: React.CSSProperties = {
  background: "rgba(10, 14, 22, 0.82)",
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.035), " +
    "0 28px 60px -20px rgba(0,0,0,0.72)",
};

const INPUT: React.CSSProperties = {
  background: "rgba(4, 7, 13, 0.9)",
  border: "1px solid rgba(255,255,255,0.07)",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Email o contrasena incorrectos");
      } else {
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] p-7 space-y-5" style={GLASS}>
        <div className="space-y-1.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Ya estas adentro
          </p>
          <h2 className="font-display text-[1.6rem] font-bold tracking-[-0.05em] text-white">
            Iniciar sesion
          </h2>
          <p className="text-sm text-slate-400">
            Entra con tu cuenta y empeza a jugar.
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
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] text-white"
            style={INPUT}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena"
            required
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] text-white"
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500">
        No tenes cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-amber-200 transition-colors hover:text-white"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
