import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentPoller } from "./PaymentPoller";
import { PoolBanner } from "@/components/PoolBanner";
import { GlobalLockCountdown } from "@/components/GlobalLockCountdown";
import { env } from "@/lib/env";

const ALIAS = env.PAYMENT_ALIAS;
const CBU = env.PAYMENT_CBU;
const OWNER = env.PAYMENT_OWNER;
const BANK = env.PAYMENT_BANK;
const AMOUNT = env.INSCRIPTION_AMOUNT?.toString() ?? "???";

const GLASS: React.CSSProperties = {
  background: "rgba(10, 14, 22, 0.82)",
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.035), " +
    "0 28px 60px -20px rgba(0,0,0,0.72)",
};

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-right text-sm font-semibold text-white ${mono ? "font-mono tracking-wider" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.isPaid) redirect("/");

  const userName = session.user.name ?? "Participante";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="space-y-4">
      <PoolBanner variant="pending" />
      <GlobalLockCountdown variant="pending" />

      <div
        className="flex items-center gap-4 rounded-[1.6rem] px-5 py-4"
        style={{
          background: "rgba(214,164,74,0.1)",
          border: "1px solid rgba(214,164,74,0.16)",
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(214,164,74,0.16)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(252,211,77,0.92)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-100">Pago pendiente de confirmacion</p>
          <p className="mt-0.5 text-xs text-amber-200/60">
            Tu acceso se activa cuando confirmemos la transferencia.
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] p-6" style={GLASS}>
        <div className="mb-5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Instrucciones
          </p>
          <h2 className="font-display text-[1.6rem] font-bold tracking-[-0.05em] text-white">
            Datos de pago
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Hace la transferencia y te habilitamos para jugar apenas la veamos.
          </p>
        </div>

        <div className="space-y-1">
          <DataRow label="Monto" value={`$${AMOUNT} ARS`} />
          <DataRow label="Alias" value={ALIAS} mono />
          <DataRow label="CBU" value={CBU} mono />
          <DataRow label="Titular" value={OWNER} />
          <DataRow label="Banco" value={BANK} />
        </div>

        <div
          className="mt-5 rounded-2xl px-4 py-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs leading-relaxed text-slate-400">
            En el concepto escribe tu nombre:
            <span className="font-semibold text-white"> {userName}</span>
            {" · Prode 2026"}
          </p>
        </div>
      </div>

      <PaymentPoller />

      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full rounded-[1.2rem] border border-white/8 py-3 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
        >
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}
