"use client";

import { useMemo, useState } from "react";

const SHARE_COPY =
  "Sumate al Prode Mundial 2026. Carga tus picks, segui el fixture y pelea arriba en el ranking del grupo.";

export default function ShareGroupCard() {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/register`;
  }, []);

  const shareText = inviteUrl ? `${SHARE_COPY} ${inviteUrl}` : SHARE_COPY;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Prode Mundial 2026",
          text: SHARE_COPY,
          url: inviteUrl,
        });
        setStatus("shared");
        return;
      } catch {
        // Ignore dismissals.
      }
    }

    await copyInvite();
  }

  function openWhatsApp() {
    if (typeof window === "undefined") return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="rounded-[1.7rem] border px-4 py-4"
      style={{
        background: "var(--app-panel-bg)",
        borderColor: "var(--app-border)",
        boxShadow: "var(--app-panel-shadow)",
      }}
    >
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Compartir grupo
      </p>
      <p className="mt-2 text-[1.05rem] font-semibold text-white">
        Invita gente sin explicar nada por mensaje.
      </p>
      <p className="mt-1 text-[0.82rem] leading-relaxed text-slate-400">
        Manda el acceso por WhatsApp o copia el link para sumar mas jugadores al pozo.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-[0.82rem] font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/12"
          style={{
            borderColor: "rgba(16,185,129,0.18)",
            background: "rgba(16,185,129,0.08)",
          }}
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={copyInvite}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-[0.82rem] font-semibold text-slate-200 transition-colors hover:bg-white/8"
          style={{
            borderColor: "var(--app-border-strong)",
            background: "var(--app-panel-soft-bg)",
          }}
        >
          Copiar link
        </button>
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-[0.82rem] font-semibold text-amber-100 transition-colors hover:bg-amber-500/12"
          style={{
            borderColor: "rgba(245,158,11,0.2)",
            background: "rgba(245,158,11,0.08)",
          }}
        >
          Compartir
        </button>
      </div>

      {status !== "idle" && (
        <p className="mt-3 text-[0.72rem] text-slate-500">
          {status === "copied" && "Link copiado."}
          {status === "shared" && "Compartido."}
          {status === "error" && "No se pudo copiar el link."}
        </p>
      )}
    </div>
  );
}
