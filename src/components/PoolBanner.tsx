import { getPoolStats, formatARS } from "@/lib/pool";

interface PoolBannerProps {
  variant?: "home" | "pending";
}

export async function PoolBanner({ variant = "home" }: PoolBannerProps) {
  const { paidUsersCount, inscriptionAmount, totalPool } = await getPoolStats();

  if (inscriptionAmount === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] px-5 py-5"
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
            "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.38) 50%, rgba(245,158,11,0) 100%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.18)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(252,211,77,0.92)"
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
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-amber-300/70">
                {variant === "pending" ? "Sumate al pozo" : "Pozo del grupo"}
              </p>
              <p className="text-[0.7rem] text-stone-400">
                Premio simple, entre amigos
              </p>
            </div>
          </div>

          <p className="font-display text-[2rem] font-bold leading-none tracking-[-0.06em] text-amber-200 sm:text-[2.35rem]">
            {formatARS(totalPool)}
          </p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-stone-400">
            {paidUsersCount} {paidUsersCount === 1 ? "jugador confirmado" : "jugadores confirmados"} ·{" "}
            {formatARS(inscriptionAmount)} por persona
          </p>
        </div>

        <div
          className="shrink-0 rounded-2xl px-3 py-2 text-right"
          style={{
            background: "var(--app-panel-subtle-bg)",
            border: "1px solid var(--app-border)",
          }}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
            Estado
          </p>
          <div className="mt-1 flex items-center justify-end gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: "rgba(250,204,21,0.7)" }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: "rgba(250,204,21,0.88)" }}
              />
            </span>
            <span className="text-[0.72rem] font-semibold text-amber-100">
              Abierto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
