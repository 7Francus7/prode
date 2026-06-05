import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPoolStats, formatARS } from "@/lib/pool";

function getInitials(name: string | null | undefined) {
  if (!name) return "AD";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatCard({
  eyebrow,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  eyebrow: string;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "neutral" | "gold" | "blue" | "green";
}) {
  const tones = {
    neutral: {
      background: "var(--app-panel-bg)",
      border: "1px solid var(--app-border)",
      valueClass: "text-white",
    },
    gold: {
      background: "var(--app-stat-amber-bg)",
      border: "1px solid var(--app-stat-amber-border)",
      valueClass: "text-amber-300",
    },
    blue: {
      background: "linear-gradient(180deg, rgba(59,130,246,0.16) 0%, var(--app-panel-bg) 100%)",
      border: "1px solid rgba(59,130,246,0.16)",
      valueClass: "text-blue-300",
    },
    green: {
      background: "var(--app-stat-emerald-bg)",
      border: "1px solid var(--app-stat-emerald-border)",
      valueClass: "text-emerald-300",
    },
  } as const;

  const toneStyles = tones[tone];

  return (
    <div
      className="relative overflow-hidden rounded-[1.5rem] p-4"
      style={{
        background: toneStyles.background,
        border: toneStyles.border,
        boxShadow: "var(--app-panel-shadow)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      <p className="theme-text-faint text-[0.58rem] font-semibold uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <p className={`mt-3 font-display text-[1.9rem] font-bold leading-none ${toneStyles.valueClass}`}>
        {value}
      </p>
      <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      {sub ? <p className="theme-text-soft mt-1 text-[0.75rem] leading-relaxed">{sub}</p> : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="theme-text-soft text-[0.78rem]">{label}</span>
      <span className="theme-text text-right text-[0.82rem] font-semibold">{value}</span>
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
        isSuperAdmin: true,
        createdAt: true,
        totalPoints: true,
        _count: { select: { predictions: true, predictionPoints: { where: { correct: true } } } },
      },
    }),
    prisma.$transaction([
      prisma.user.count({ where: { isAdmin: false, isBlocked: false } }),
      prisma.user.count({ where: { isPaid: true, isAdmin: false, isBlocked: false } }),
      prisma.prediction.count({ where: { user: { isAdmin: false, isBlocked: false } } }),
      prisma.predictionPoints.count({ where: { correct: true, user: { isAdmin: false, isBlocked: false } } }),
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
  if (session?.user?.isBlocked) redirect("/blocked");
  if (!session?.user?.isAdmin) redirect("/");

  const data = await getAdminData(session.user.id);

  const joined = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.admin.createdAt));

  const globalAccuracy =
    data.totalPredictions > 0
      ? Math.round((data.correctPredictions / data.totalPredictions) * 100)
      : 0;

  const pendingUsers = Math.max(data.totalUsers - data.paidUsers, 0);
  const completionRate =
    data.totalUsers > 0 ? Math.round((data.paidUsers / data.totalUsers) * 100) : 0;

  const quickActions = [
    {
      href: "/admin/users",
      label: "Gestion de usuarios",
      desc: pendingUsers > 0 ? `${pendingUsers} pagos por revisar` : "Todos los pagos al dia",
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      tone: "blue",
    },
    {
      href: "/admin/matches",
      label: "Control de partidos",
      desc: `${data.finishedMatches} cerrados · ${data.pendingMatches} pendientes`,
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      tone: "gold",
    },
    {
      href: "/admin/sync",
      label: "Sync y puntos",
      desc: "Resultados, recalc y chequeo operativo",
      icon: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
      tone: "green",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-5 py-5"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <div
          className="absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.32) 50%, rgba(245,158,11,0) 100%)",
          }}
        />
        <div
          className="absolute -left-10 top-8 h-28 w-28 rounded-full blur-3xl"
          style={{ background: "rgba(59,130,246,0.12)" }}
        />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] text-xl font-black"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.22) 100%)",
                border: "1px solid rgba(59,130,246,0.18)",
                color: "rgba(96,165,250,0.92)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.36)",
              }}
            >
              {getInitials(data.admin.name)}
            </div>

            <div className="min-w-0">
              <p className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
                Admin center
              </p>
              <h1 className="mt-1 font-display text-[2rem] font-bold leading-none text-white">
                Mi perfil admin
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="theme-text text-[0.98rem] font-semibold">{data.admin.name ?? "Admin"}</p>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.16)",
                    color: "rgba(96,165,250,0.92)",
                  }}
                >
                  {data.admin.isSuperAdmin ? "Super admin" : "Operador"}
                </span>
              </div>
              <p className="theme-text-soft mt-1 truncate text-[0.82rem]">{data.admin.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 self-stretch md:min-w-[17rem]">
            <div className="theme-panel rounded-[1.2rem] px-4 py-3">
              <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.2em]">
                Miembro desde
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{joined}</p>
            </div>
            <div className="theme-panel rounded-[1.2rem] px-4 py-3">
              <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.2em]">
                Cobertura
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{completionRate}% activa</p>
            </div>
          </div>
        </div>
      </section>

      <div>
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Vista general
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            eyebrow="Base"
            label="Usuarios"
            value={data.totalUsers}
            sub={`${data.paidUsers} inscriptos`}
            tone="neutral"
          />
          <StatCard
            eyebrow="Pozo"
            label="Total acumulado"
            value={formatARS(data.poolStats.totalPool)}
            sub={`${formatARS(data.poolStats.inscriptionAmount)} por persona`}
            tone="gold"
          />
          <StatCard
            eyebrow="Actividad"
            label="Predicciones"
            value={data.totalPredictions}
            sub={`${data.correctPredictions} aciertos totales`}
            tone="blue"
          />
          <StatCard
            eyebrow="Precision"
            label="Efectividad global"
            value={`${globalAccuracy}%`}
            sub={`${data.finishedMatches} partidos resueltos`}
            tone="green"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <section className="theme-panel overflow-hidden rounded-[1.7rem]">
          <div className="px-4 py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Estado operativo
            </p>
          </div>
          <div className="divide-y divide-brand-border">
            <DetailRow label="Partidos terminados" value={String(data.finishedMatches)} />
            <DetailRow label="Partidos programados" value={String(data.pendingMatches)} />
            <DetailRow label="Usuarios pendientes de pago" value={String(pendingUsers)} />
            <DetailRow label="Aciertos administrados" value={String(data.correctPredictions)} />
          </div>
        </section>

        <section className="theme-panel overflow-hidden rounded-[1.7rem]">
          <div className="px-4 py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Mi actividad
            </p>
          </div>
          <div className="divide-y divide-brand-border">
            <DetailRow label="Predicciones admin" value={String(data.admin._count.predictions)} />
            <DetailRow label="Aciertos admin" value={String(data.admin._count.predictionPoints)} />
            <DetailRow label="Puntos admin" value={String(data.admin.totalPoints)} />
            <DetailRow
              label="Estado del pozo"
              value={pendingUsers > 0 ? "Requiere seguimiento" : "Todo al dia"}
            />
          </div>
        </section>
      </div>

      <div>
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Acciones rapidas
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {quickActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-[1.6rem] border p-4 transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  item.tone === "blue"
                    ? "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, var(--app-panel-bg) 100%)"
                    : item.tone === "gold"
                      ? "linear-gradient(180deg, rgba(245,158,11,0.12) 0%, var(--app-panel-bg) 100%)"
                      : "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, var(--app-panel-bg) 100%)",
                borderColor:
                  item.tone === "blue"
                    ? "rgba(59,130,246,0.16)"
                    : item.tone === "gold"
                      ? "rgba(245,158,11,0.16)"
                      : "rgba(16,185,129,0.16)",
                boxShadow: "var(--app-panel-shadow)",
              }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <p className="text-base font-bold text-white">{item.label}</p>
              <p className="theme-text-soft mt-1 text-[0.8rem] leading-relaxed">{item.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[0.72rem] font-semibold text-slate-500 transition-colors group-hover:text-white">
                Abrir
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
