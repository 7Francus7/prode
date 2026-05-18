import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  return (
    <div className="min-h-screen bg-brand-dark">
      <div
        className="border-b px-4 flex items-center gap-4 sticky top-0 z-50"
        style={{
          background: "rgba(8, 12, 22, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.07)",
          paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
        }}
      >
        <Link href="/" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          ← Volver
        </Link>
        <span className="text-[11px] text-slate-700">|</span>
        <nav className="flex gap-4">
          {[
            { href: "/admin/users", label: "Usuarios" },
            { href: "/admin/matches", label: "Partidos" },
            { href: "/admin/sync", label: "Sync" },
            { href: "/admin/profile", label: "Perfil" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-4 py-6 max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
