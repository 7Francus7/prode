import { getPoolStats, formatARS } from "@/lib/pool";

interface PoolBannerProps {
  variant?: "home" | "pending";
}

export async function PoolBanner({ variant = "home" }: PoolBannerProps) {
  const { paidUsersCount, inscriptionAmount, totalPool } = await getPoolStats();

  if (inscriptionAmount === 0) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 160% 100% at 50% -10%, rgba(202,138,4,0.1) 0%, transparent 65%), " +
          "rgba(9,14,26,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(202,138,4,0.16)",
        boxShadow: "0 0 48px -12px rgba(202,138,4,0.12), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(202,138,4,0.1) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(202,138,4,0.12)",
            border: "1px solid rgba(202,138,4,0.2)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(250,204,21,0.85)"
            strokeWidth="1.5"
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
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5"
            style={{ color: "rgba(202,138,4,0.6)" }}
          >
            {variant === "pending" ? "¡Sumate al pozo!" : "Pozo actual"}
          </p>
          <p
            className="text-[26px] font-black leading-none tracking-tight"
            style={{ color: "rgba(250,204,21,0.95)" }}
          >
            {formatARS(totalPool)}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(148,163,184,0.45)" }}>
            {paidUsersCount} {paidUsersCount === 1 ? "jugador" : "jugadores"} ×{" "}
            {formatARS(inscriptionAmount)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: "rgba(250,204,21,0.7)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "rgba(250,204,21,0.85)" }}
            />
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-wider"
            style={{ color: "rgba(202,138,4,0.5)" }}
          >
            live
          </span>
        </div>
      </div>
    </div>
  );
}
