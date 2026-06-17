import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRankingEntries } from "@/lib/ranking";
import Podium from "@/components/Podium";
import RankingTable from "@/components/RankingTable";
import MyPositionBanner from "@/components/MyPositionBanner";
import type { RankingEntry } from "@/types";

function getArgentinaDayRange(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  const day = `${value("year")}-${value("month")}-${value("day")}`;
  const start = new Date(`${day}T03:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export const dynamic = "force-dynamic";

async function getRanking(): Promise<RankingEntry[]> {
  const today = getArgentinaDayRange();
  const [users, todayRows] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false, isBlocked: false },
      select: {
        id: true,
        name: true,
        image: true,
        totalPoints: true,
        predictionPoints: {
          where: { correct: true },
          select: { id: true },
        },
        _count: {
          select: {
            predictions: true,
            predictionPoints: true,
          },
        },
      },
      orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
    }),
    prisma.predictionPoints.groupBy({
      by: ["userId"],
      where: {
        correct: true,
        user: { isAdmin: false, isBlocked: false },
        match: { matchDate: { gte: today.start, lt: today.end }, groupId: { not: null } },
      },
      _count: { _all: true },
    }),
  ]);

  const todayByUser = new Map(todayRows.map((row) => [row.userId, row._count._all]));
  return buildRankingEntries(users).map((entry) => ({
    ...entry,
    todayPoints: todayByUser.get(entry.id) ?? 0,
  }));
}

export default async function RankingPage() {
  const session = await auth();
  const ranking = await getRanking();
  const top3 = ranking.slice(0, 3);
  const myEntry = ranking.find((e) => e.id === session?.user.id);
  const bestToday = [...ranking].sort((a, b) => (b.todayPoints ?? 0) - (a.todayPoints ?? 0))[0];
  const totalTodayPoints = ranking.reduce((sum, entry) => sum + (entry.todayPoints ?? 0), 0);

  return (
    <div className="space-y-6">

      {/* Sticky my-position banner */}
      {myEntry && <MyPositionBanner entry={myEntry} total={ranking.length} />}

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Clasificación</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Ranking</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.45rem] border border-white/6 bg-white/3 px-4 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Movimiento hoy</p>
          <p className="mt-2 font-display text-[1.8rem] font-black leading-none text-emerald-300">+{totalTodayPoints}</p>
          <p className="mt-1 text-[11px] text-slate-500">puntos repartidos</p>
        </div>
        <div className="rounded-[1.45rem] border border-white/6 bg-white/3 px-4 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Mejor del dia</p>
          <p className="mt-2 truncate text-sm font-black text-white">{bestToday?.name ?? "Sin puntos"}</p>
          <p className="mt-1 text-[11px] text-slate-500">+{bestToday?.todayPoints ?? 0} hoy</p>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-brand-border bg-brand-card">
          <div className="w-14 h-14 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          </div>
          <p className="text-slate-400 font-semibold text-sm">Nadie ha sumado puntos aún</p>
          <p className="text-slate-700 text-xs mt-1.5">El Mundial arranca el 11 de junio</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="rounded-2xl border border-brand-border bg-brand-card pt-5 pb-0 overflow-hidden">
              <p className="text-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.18em] mb-4">
                Podio
              </p>
              <Podium entries={top3} />
            </div>
          )}

          {/* Full table */}
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] mb-3">
              Tabla completa
            </p>
            <RankingTable
              entries={ranking}
              currentUserId={session?.user.id}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 py-2">
            {[
              { label: "Pts", desc: "Puntos" },
              { label: "Hoy", desc: "Movimiento" },
              { label: "%", desc: "Efectividad" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase">{l.label}</span>
                <span className="text-[10px] text-slate-700">= {l.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
