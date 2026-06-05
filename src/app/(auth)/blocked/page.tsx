import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const GLASS: React.CSSProperties = {
  background: "var(--app-glass-bg)",
  backdropFilter: "blur(24px) saturate(1.4)",
  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
  border: "1px solid var(--app-glass-border)",
  boxShadow: "var(--app-glass-shadow)",
};

export default async function BlockedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isBlocked) redirect("/");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] p-7" style={GLASS}>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Cuenta bloqueada
        </p>
        <h2 className="mt-1 font-display text-[1.6rem] font-bold tracking-[-0.05em] text-white">
          Acceso pausado
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Tu cuenta fue bloqueada por un administrador. Contacta al organizador del grupo para revisar el acceso.
        </p>
      </div>

      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-[1.2rem] border border-white/8 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
        >
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}
