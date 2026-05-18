import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMatchLocked, isGlobalPredictionLocked } from "@/lib/utils";
import MatchCard from "@/components/MatchCard";
import StatsCards from "@/components/StatsCards";
import { PoolBanner } from "@/components/PoolBanner";
import { GlobalLockCountdown } from "@/components/GlobalLockCountdown";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { MatchWithTeams } from "@/types";
import type { PredictionResult } from "@prisma/client";

async function getHomeData(userId: string) {
  const [liveMatches, nextMatches, ranking, userRecord, correctCount] =
    await Promise.all([
      prisma.match.findMany({
        where: { status: "LIVE" },
        include: {
          homeTeam: true,
          awayTeam: true,
          group: true,
          predictions: { where: { userId }, take: 1 },
        },
        orderBy: { matchDate: "asc" },
      }),
      prisma.match.findMany({
        where: { status: "SCHEDULED", matchDate: { gte: new Date() } },
        include: {
          homeTeam: true,
          awayTeam: true,
          group: true,
          predictions: { where: { userId }, take: 1 },
        },
        orderBy: { matchDate: "asc" },
        take: 5,
      }),
      prisma.user.findMany({
        where: { isAdmin: false },
        select: { id: true, name: true, totalPoints: true },
        orderBy: { totalPoints: "desc" },
        take: 5,
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
      prisma.predictionPoints.count({ where: { userId, correct: true } }),
    ]);

  const totalPoints = userRecord?.totalPoints ?? 0;

  // Count users with strictly more points to get 1-based rank (ties share the same rank)
  const userRank = totalPoints > 0
    ? (await prisma.user.count({ where: { totalPoints: { gt: totalPoints } } })) + 1
    : 0;

  return { liveMatches, nextMatches, ranking, totalPoints, correctCount, userRank };
}

function toMatchWithTeams(
  m: Awaited<ReturnType<typeof getHomeData>>["nextMatches"][number]
): MatchWithTeams {
  const pred = m.predictions[0];
  return {
    ...m,
    isLocked: isMatchLocked(m.matchDate),
    myPrediction: pred ? (pred.prediction as PredictionResult) : null,
  } as MatchWithTeams;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  let homeData;
  try {
    homeData = await getHomeData(userId);
  } catch (err) {
    console.error("[home] error:", err);
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 text-sm">Error al cargar datos. Intentá de nuevo.</p>
      </div>
    );
  }
  const { liveMatches, nextMatches, ranking, totalPoints, correctCount, userRank } = homeData;
  const globalLocked = isGlobalPredictionLocked();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">
          FIFA World Cup
        </p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">
          Prode <span className="text-blue-400">2026</span>
        </h1>
      </div>

      {/* Prize pool */}
      <PoolBanner />

      {/* Global lock countdown */}
      <GlobalLockCountdown />

      {/* Stats */}
      <StatsCards totalPoints={totalPoints} correctCount={correctCount} rank={userRank} />

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <h2 className="text-[11px] font-bold text-red-400 uppercase tracking-[0.14em]">
              En vivo
            </h2>
          </div>
          <div className="space-y-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={toMatchWithTeams(m)} isAuthenticated globalLocked={globalLocked} />
            ))}
          </div>
        </section>
      )}

      {/* Next matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
            Próximos partidos
          </h2>
          <Link
            href="/fixture"
            className="text-[11px] font-semibold text-blue-500 flex items-center gap-1"
          >
            Ver todos
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
        {nextMatches.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-brand-border bg-brand-card">
            <p className="text-slate-600 text-sm">No hay partidos próximos</p>
            <p className="text-slate-700 text-xs mt-1">El Mundial arranca el 11 de junio</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextMatches.map((m) => (
              <MatchCard key={m.id} match={toMatchWithTeams(m)} isAuthenticated globalLocked={globalLocked} />
            ))}
          </div>
        )}
      </section>

      {/* Quick action */}
      <Link
        href="/predictions"
        className="flex items-center gap-3 p-4 rounded-2xl border border-brand-border bg-brand-card active:bg-brand-card-2 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Mis predicciones</p>
          <p className="text-[11px] text-slate-600">Ver historial y aciertos</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {/* Mini ranking */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
            Ranking
          </h2>
          <Link
            href="/ranking"
            className="text-[11px] font-semibold text-blue-500 flex items-center gap-1"
          >
            Ver completo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
        {ranking.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-brand-border bg-brand-card">
            <p className="text-slate-600 text-sm">Nadie ha sumado puntos aún</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-border overflow-hidden bg-brand-card divide-y divide-brand-border">
            {ranking.map((u, i) => {
              const isMe = u.id === userId;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-blue-600/8 border-l-2 border-l-blue-500" : ""}`}
                >
                  <span className="text-sm w-5 text-center">
                    {i < 3 ? medals[i] : <span className="text-slate-600 font-mono text-xs">{i + 1}</span>}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">
                    {getInitials(u.name)}
                  </div>
                  <span
                    className={`flex-1 text-sm font-semibold truncate ${isMe ? "text-blue-400" : "text-white"}`}
                  >
                    {u.name ?? "Anónimo"}
                    {isMe && (
                      <span className="ml-1.5 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                        vos
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-black text-white tabular-nums">
                    {u.totalPoints}
                    <span className="text-[10px] font-normal text-slate-600 ml-0.5">pts</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
