"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GLASS: React.CSSProperties = {
  background: "rgba(9, 14, 26, 0.78)",
  backdropFilter: "blur(24px) saturate(1.6)",
  WebkitBackdropFilter: "blur(24px) saturate(1.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,0.025), " +
    "0 24px 56px -8px rgba(0,0,0,0.65), " +
    "0 0 80px -24px rgba(37,99,235,0.1)",
};

const INPUT: React.CSSProperties = {
  background: "rgba(5, 9, 20, 0.9)",
  border: "1px solid rgba(255,255,255,0.07)",
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
        // Auto-login after register, then go to pending payment screen
        const { signIn } = await import("next-auth/react");
        await signIn("credentials", { email, password, redirect: false });
        router.push("/pending");
      }
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-7 space-y-5" style={GLASS}>
        <div>
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            Crear cuenta
          </h2>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.38)" }}>
            Completá tus datos para registrarte
          </p>
        </div>

        {error && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 relative overflow-hidden"
            style={{
              background: "rgba(127,29,29,0.16)",
              border: "1px solid rgba(239,68,68,0.13)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
              style={{ background: "rgba(239,68,68,0.38)" }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(252,165,165,0.75)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-sm" style={{ color: "rgba(252,165,165,0.82)" }}>
              {error}
            </p>
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
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] text-white"
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
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] text-white"
            style={INPUT}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6 caracteres)"
            required
            minLength={6}
            className="input-premium w-full rounded-[14px] px-4 py-4 text-[15px] text-white"
            style={INPUT}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full min-h-[52px] rounded-[14px] text-white font-bold text-[15px] mt-2"
          >
            <span className="relative z-10">
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </span>
          </button>
        </form>
      </div>

      <p className="text-center text-xs" style={{ color: "rgba(100,116,139,0.65)" }}>
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
