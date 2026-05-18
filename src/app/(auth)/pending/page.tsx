import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentPoller } from "./PaymentPoller";

const ALIAS = process.env.PAYMENT_ALIAS ?? "alias.banco.ejemplo";
const CBU = process.env.PAYMENT_CBU ?? "0000000000000000000000";
const OWNER = process.env.PAYMENT_OWNER ?? "Nombre Titular";
const BANK = process.env.PAYMENT_BANK ?? "Banco";
const AMOUNT = process.env.INSCRIPTION_AMOUNT ?? "???";

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

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.5)" }}>
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-white text-right ${mono ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // If admin activated the user, auto-redirect
  if (session.user.isPaid) redirect("/");

  const userName = session.user.name ?? "Participante";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{
          background: "rgba(202,138,4,0.08)",
          border: "1px solid rgba(202,138,4,0.18)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(202,138,4,0.15)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,0.85)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "rgba(250,204,21,0.9)" }}>
            Pago pendiente de confirmación
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(250,204,21,0.5)" }}>
            Tu acceso se activa cuando confirmemos tu transferencia
          </p>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="rounded-2xl p-6 space-y-1" style={GLASS}>
        <div className="mb-4">
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            Datos de pago
          </h2>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.38)" }}>
            Realizá la transferencia con los datos a continuación
          </p>
        </div>

        <DataRow label="Monto" value={`$${AMOUNT} ARS`} />
        <DataRow label="Alias" value={ALIAS} mono />
        <DataRow label="CBU" value={CBU} mono />
        <DataRow label="Titular" value={OWNER} />
        <DataRow label="Banco" value={BANK} />

        <div
          className="mt-4 rounded-xl px-4 py-3.5"
          style={{
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.15)",
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "rgba(148,163,184,0.65)" }}>
            En el concepto escribí tu nombre:{" "}
            <span className="font-semibold text-white">{userName}</span>
            {" · Prode 2026"}
          </p>
        </div>
      </div>

      {/* Auto check indicator */}
      <PaymentPoller />

      {/* Footer */}
      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full text-xs font-medium py-2.5 rounded-xl transition-colors"
          style={{ color: "rgba(100,116,139,0.6)", background: "transparent" }}
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
