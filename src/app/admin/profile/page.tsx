import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getPoolStats, formatARS } from "@/lib/pool";

function StatCard({
  label,
  value,
  sub,
  accent = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
      <p className={`text-2xl font-black leading-none ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

async function getAdminData(adminId: string) {
  const [admin, appStats, poolStats, finishedMatches, pendingMatches] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: adminId },
      select: {
        name: true,
        email: true,
        createdAt: true,
        totalPoints: true,
        _count: { select: { predictions: true, predictionPoints: { where: { correct: true } } } },
      },
    }),
    prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { isPaid: true } }),
      prisma.prediction.count(),
      prisma.predictionPoints.count({ where: { correct: true } }),
    ]),
    getPoolStats(),
    prisma.match.count({ where: { status: "FINISHED" } }),
    prisma.match.count({ where: { status: "SCHEDULED" } }),
  ]);

  const [totalUsers, paidUsers, totalPredictions, correctPredictions] = appStats;

  return {
    admin,
    totalUsers,
    paidUsers,
    totalPredictions,
    correctPredictions,
    poolStats,
    finishedMatches,
    pendingMatches,
  };
}

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const d = await getAdminData(session.user.id);

  const joined = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d.admin.createdAt));

  const globalAccuracy =
    d.totalPredictions > 0
      ? Math.round((d.correctPredictions / d.totalPredictions) * 100)
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Admin</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Mi perfil</h1>
      </div>

      {/* Identity */}
      <div className="rounded-2xl border border-violet-800/30 bg-violet-600/5 p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-violet-600/20 border-2 border-violet-600/30 flex items-center justify-center text-xl font-black text-violet-300 flex-shrink-0">
          {(d.admin.name ?? "A")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-bold text-white">{d.admin.name ?? "Admin"}</p>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-600/30 text-violet-400">
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 truncate">{d.admin.email}</p>
          <p className="text-[10px] text-slate-700 mt-1">Miembro desde {joined}</p>
        </div>
      </div>

      {/* App-wide stats */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
          Estado de la app
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="Usuarios totales"
            value={d.totalUsers}
            sub={`${d.paidUsers} inscriptos`}
            accent="text-white"
          />
          <StatCard
            label="Pozo total"
            value={formatARS(d.poolStats.totalPool)}
            sub={`${d.paidUsers} × ${formatARS(d.poolStats.inscriptionAmount)}`}
            accent="text-amber-400"
          />
          <StatCard
            label="Predicciones totales"
            value={d.totalPredictions}
            sub={`${d.correctPredictions} aciertos`}
            accent="text-blue-400"
          />
          <StatCard
            label="Efectividad global"
            value={`${globalAccuracy}%`}
            sub={`${d.finishedMatches} partidos terminados`}
            accent="text-emerald-400"
          />
        </div>
      </div>

      {/* Match status */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
          Partidos
        </p>
        <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden divide-y divide-brand-border">
          <Row label="Terminados" value={String(d.finishedMatches)} />
          <Row label="Programados" value={String(d.pendingMatches)} />
          <Row label="Usuarios sin pagar" value={String(d.totalUsers - d.paidUsers)} />
        </div>
      </div>

      {/* Admin's own predictions */}
      {d.admin._count.predictions > 0 && (
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
            Mis predicciones (admin)
          </p>
          <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden divide-y divide-brand-border">
            <Row label="Total" value={String(d.admin._count.predictions)} />
            <Row label="Aciertos" value={String(d.admin._count.predictionPoints)} />
            <Row label="Puntos" value={String(d.admin.totalPoints)} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
          Acciones rápidas
        </p>
        <div className="space-y-2">
          {[
            { href: "/admin/users", label: "Gestión de usuarios", desc: `${d.totalUsers - d.paidUsers} pendientes de pago`, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
            { href: "/admin/matches", label: "Gestión de partidos", desc: `${d.finishedMatches} terminados · ${d.pendingMatches} pendientes`, icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
            { href: "/admin/sync", label: "Sync y puntos", desc: "Sincronizar resultados y recalcular", icon: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-2xl border border-brand-border bg-brand-card active:bg-brand-card-2 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-card-2 border border-brand-border flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-[11px] text-slate-600 truncate">{item.desc}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 flex-shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
