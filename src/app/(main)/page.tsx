import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAccuracy, getSharedRankByPoints } from "@/lib/ranking";
import { isMatchLocked, isGlobalPredictionLocked } from "@/lib/utils";
import MatchCard from "@/components/MatchCard";
import StatsCards from "@/components/StatsCards";
import MyPositionBanner from "@/components/MyPositionBanner";
import { PoolBanner } from "@/components/PoolBanner";
import { GlobalLockCountdown } from "@/components/GlobalLockCountdown";
import PushNotificationCard from "@/components/PushNotificationCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { MatchWithTeams, RankingEntry } from "@/types";
import type { PredictionResult } from "@prisma/client";

async function getHomeData(userId: string) {
  const [
    liveMatches,
    nextMatches,
    ranking,
    userRecord,
    correctCount,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
  ] = await Promise.all([
    prisma.match.findMany({
      where: { status: "LIVE", groupId: { not: null } },
      include: {
        homeTeam: true,
        awayTeam: true,
        group: true,
        predictions: { where: { userId }, take: 1 },
      },
      orderBy: { matchDate: "asc" },
    }),
    prisma.match.findMany({
      where: { status: "SCHEDULED", groupId: { not: null } },
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
    prisma.prediction.count({ where: { userId } }),
    prisma.predictionPoints.count({ where: { userId } }),
    prisma.user.count({ where: { isAdmin: false } }),
  ]);

  const totalPoints = userRecord?.totalPoints ?? 0;
  const userRank = userRecord
    ? (await prisma.user.count({
        where: { isAdmin: false, totalPoints: { gt: totalPoints } },
      })) + 1
    : 0;

  return {
    liveMatches,
    nextMatches,
    ranking,
    totalPoints,
    correctCount,
    userRank,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
  };
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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SectionShell({
  eyebrow,
  title,
  href,
  hrefLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-[1.8rem] border px-4 py-5 sm:px-5"
      style={{
        background: "var(--app-panel-bg)",
        borderColor: "var(--app-border)",
        boxShadow: "var(--app-panel-shadow)",
      }}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="font-display text-[1.35rem] font-bold text-white">
            {title}
          </h2>
        </div>
        {href && hrefLabel && (
          <Link
            href={href}
            className="theme-outline-button inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold transition-colors hover:[color:var(--app-text)]"
          >
            {hrefLabel}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">Error al cargar datos. Intentá de nuevo.</p>
      </div>
    );
  }

  const {
    liveMatches,
    nextMatches,
    ranking,
    totalPoints,
    correctCount,
    userRank,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
  } = homeData;

  const globalLocked = isGlobalPredictionLocked();
  const rankingDisplayRanks = ranking.map((_, index) => getSharedRankByPoints(ranking, index));
  const inTopVisible = ranking.some((u) => u.id === userId);
  const pendingPredictions = Math.max(totalPredictions - resolvedPredictions, 0);
  const userLabel = session.user.name?.split(" ")[0] ?? "Jugador";

  const myEntry: RankingEntry | null = userRank > 0
    ? {
        rank: userRank,
        id: userId,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        totalPoints,
        correctPredictions: correctCount,
        totalPredictions,
        accuracy: calculateAccuracy(correctCount, resolvedPredictions),
      }
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-4 py-5 sm:px-5 sm:py-6"
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
              "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.34) 50%, rgba(245,158,11,0) 100%)",
          }}
        />

        <div className="relative space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-amber-200/80"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.16)",
                }}
              >
                Mundial 2026
              </span>
              <span className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">
                Grupo entre amigos
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-stone-300">
                {userLabel}, tu jornada arranca acá.
              </p>
              <h1 className="font-display text-[2.3rem] font-bold leading-[0.95] text-white sm:text-[2.8rem]">
                Prode <span className="text-amber-200">simple</span>,
                <br />
                rápido y con peso real.
              </h1>
              <p className="max-w-[32rem] text-[0.94rem] leading-relaxed text-slate-400">
                Mirá el pozo, el cierre global y tus próximos partidos sin perderte entre bloques repetidos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/predictions"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-[0.84rem] font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #d6a44a 0%, #8f5c1f 100%)",
                  boxShadow: "0 12px 24px -14px rgba(214,164,74,0.75)",
                }}
              >
                Ver mis predicciones
              </Link>
              <Link
                href="/fixture"
                className="theme-outline-button inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-[0.84rem] font-semibold transition-colors hover:[color:var(--app-text)]"
              >
                Abrir fixture completo
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <PoolBanner />
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <GlobalLockCountdown />
              {session.user.isPaid ? (
                <PushNotificationCard />
              ) : (
                <div
                  className="rounded-[1.6rem] border px-4 py-4"
                  style={{
                    background: "var(--app-panel-subtle-bg)",
                    borderColor: "var(--app-border)",
                  }}
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Estado de juego
                  </p>
                  <p className="mt-2 text-[1.1rem] font-semibold text-white">
                    {pendingPredictions > 0
                      ? `${pendingPredictions} pendientes por resolver`
                      : "Todas tus predicciones están al día"}
                  </p>
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-slate-400">
                    Cuando se resuelvan los partidos, tu efectividad y tu posición se actualizan automáticamente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tu campaña
            </p>
            <StatsCards totalPoints={totalPoints} correctCount={correctCount} rank={userRank} />
          </div>
        </div>
      </section>

      {liveMatches.length > 0 && (
        <SectionShell eyebrow="Ahora" title="Partidos en vivo">
          <div className="mb-4 flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-red-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Actualizando resultados
          </div>
          <div className="space-y-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={toMatchWithTeams(m)} isAuthenticated globalLocked={globalLocked} />
            ))}
          </div>
        </SectionShell>
      )}

      <SectionShell
        eyebrow="Agenda"
        title="Próximos partidos"
        href="/fixture"
        hrefLabel="Ver fixture"
      >
        {nextMatches.length === 0 ? (
          <div
            className="rounded-[1.5rem] border px-4 py-10 text-center"
            style={{
              background: "var(--app-panel-subtle-bg)",
              borderColor: "var(--app-border)",
            }}
          >
            <p className="font-display text-[1.25rem] font-bold text-white">
              No hay partidos próximos
            </p>
            <p className="mt-2 text-sm text-slate-400">
              El Mundial arranca el 11 de junio.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextMatches.map((m) => (
              <MatchCard key={m.id} match={toMatchWithTeams(m)} isAuthenticated globalLocked={globalLocked} />
            ))}
          </div>
        )}
      </SectionShell>

      {myEntry && !inTopVisible && (
        <MyPositionBanner entry={myEntry} total={totalUsers} />
      )}

      <SectionShell
        eyebrow="Pulso del grupo"
        title="Ranking corto"
        href="/ranking"
        hrefLabel="Tabla completa"
      >
        {ranking.length === 0 ? (
          <div
            className="rounded-[1.5rem] border px-4 py-8 text-center"
            style={{
              background: "var(--app-panel-subtle-bg)",
              borderColor: "var(--app-border)",
            }}
          >
            <p className="font-display text-[1.15rem] font-bold text-white">
              Nadie sumó puntos todavía
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Apenas terminen los primeros partidos, el ranking empieza a moverse.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/6 bg-black/10">
            {ranking.map((u, i) => {
              const isMe = u.id === userId;
              const displayRank = rankingDisplayRanks[i];
              const medals = ["🥇", "🥈", "🥉"];

              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < ranking.length - 1 ? "border-b border-white/6" : ""} ${
                    isMe ? "bg-amber-400/[0.06]" : ""
                  }`}
                >
                  <span className="w-6 text-center text-sm">
                    {displayRank <= 3 ? (
                      medals[displayRank - 1]
                    ) : (
                      <span className="font-mono text-xs text-slate-500">{displayRank}</span>
                    )}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/7 bg-white/5 text-[10px] font-bold text-slate-300">
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${isMe ? "text-amber-100" : "text-white"}`}>
                      {u.name ?? "Anónimo"}
                      {isMe && (
                        <span className="ml-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-amber-300/70">
                          vos
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[1.15rem] font-bold leading-none text-white">
                      {u.totalPoints}
                    </p>
                    <p className="text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">
                      pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionShell>
    </div>
  );
}
