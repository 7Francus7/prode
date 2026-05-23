import { getPoolStats, formatARS } from "@/lib/pool";

interface PoolBannerProps {
  variant?: "home" | "pending";
}

export async function PoolBanner({ variant = "home" }: PoolBannerProps) {
  const { paidUsersCount, inscriptionAmount, totalPool } = await getPoolStats();

  if (inscriptionAmount === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[1.85rem] px-5 py-5 sm:px-6"
      style={{
        background: "var(--app-pool-bg)",
        border: "1px solid var(--app-pool-border)",
        boxShadow: "var(--app-pool-shadow)",
      }}
    >
      <div
        className="absolute inset-x-5 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.42) 50%, rgba(245,158,11,0) 100%)",
        }}
      />
      <div
        className="absolute -left-14 top-10 h-28 w-28 rounded-full blur-3xl"
        style={{ background: "rgba(245,158,11,0.14)" }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem]"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.48)",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(245,158,11,0.9)"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
              </svg>
            </span>

            <div>
              <p
                className="text-[0.62rem] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--app-accent-strong)" }}
              >
                {variant === "pending" ? "Sumate al pozo" : "Pozo del grupo"}
              </p>
              <p className="theme-text-muted text-[0.8rem]">
                Simple, entre amigos
              </p>
            </div>
          </div>

          <p
            className="font-display text-[2.2rem] font-bold leading-none tracking-[-0.06em] sm:text-[2.55rem]"
            style={{ color: "var(--app-accent-strong)" }}
          >
            {formatARS(totalPool)}
          </p>
          <p className="theme-text-muted mt-2 text-[0.88rem] leading-relaxed">
            {paidUsersCount} {paidUsersCount === 1 ? "jugador confirmado" : "jugadores confirmados"} ·{" "}
            {formatARS(inscriptionAmount)} por persona
          </p>
        </div>

        <div
          className="shrink-0 rounded-[1.25rem] px-4 py-3"
          style={{
            background: "var(--app-panel-soft-bg)",
            border: "1px solid var(--app-border)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <p className="theme-text-faint text-[0.6rem] font-semibold uppercase tracking-[0.22em]">
            Estado
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: "rgba(250,204,21,0.7)" }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ background: "rgba(250,204,21,0.9)" }}
              />
            </span>
            <span className="text-[0.82rem] font-semibold" style={{ color: "var(--app-accent-strong)" }}>
              Abierto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
