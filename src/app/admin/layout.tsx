import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const adminLinks = [
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/matches", label: "Partidos" },
  { href: "/admin/sync", label: "Sync" },
  { href: "/admin/profile", label: "Perfil" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.isBlocked) redirect("/blocked");
  if (!session?.user?.isAdmin) redirect("/");

  return (
    <div className="min-h-screen" style={{ background: "var(--app-body-bg)" }}>
      <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-[1.6rem] border"
          style={{
            background: "var(--app-glass-bg)",
            borderColor: "var(--app-glass-border)",
            boxShadow: "var(--app-glass-shadow)",
            backdropFilter: "blur(24px) saturate(1.35)",
            WebkitBackdropFilter: "blur(24px) saturate(1.35)",
          }}
        >
          <div
            className="px-4 py-3 sm:px-5"
            style={{
              paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
            }}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[1rem] text-sm font-black"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.22) 100%)",
                    border: "1px solid rgba(59,130,246,0.16)",
                    color: "rgba(96,165,250,0.94)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.36)",
                  }}
                >
                  AD
                </div>

                <div className="min-w-0">
                  <p className="theme-text-faint text-[0.58rem] font-semibold uppercase tracking-[0.24em]">
                    Control room
                  </p>
                  <p className="theme-text text-[0.98rem] font-bold leading-none">
                    Panel de administracion
                  </p>
                  <p className="theme-text-soft mt-1 truncate text-[0.72rem]">
                    Operando como {session.user.name ?? "Admin"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <nav className="flex flex-wrap gap-2">
                  {adminLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex min-h-[40px] items-center rounded-full border px-3.5 text-[0.78rem] font-semibold transition-colors hover:[color:var(--app-text)]"
                      style={{
                        background: "var(--app-panel-soft-bg)",
                        borderColor: "var(--app-border)",
                        color: "var(--app-text-muted)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.38)",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex min-h-[40px] items-center rounded-full border px-3.5 text-[0.78rem] font-semibold transition-colors"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      borderColor: "rgba(239,68,68,0.14)",
                      color: "rgba(248,113,113,0.9)",
                    }}
                  >
                    Salir
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pb-8 pt-5 sm:px-4 sm:pt-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
