import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="border-b border-brand-border bg-brand-card/50 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          ← Volver
        </Link>
        <span className="text-[11px] text-slate-700">|</span>
        <nav className="flex gap-3">
          <Link
            href="/admin/matches"
            className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Partidos
          </Link>
          <Link
            href="/admin/sync"
            className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sync
          </Link>
        </nav>
      </div>
      <div className="px-4 py-6 max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
