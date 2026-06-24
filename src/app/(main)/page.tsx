import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPredictionBreakdowns, withPredictionBreakdown } from "@/lib/matchInsights";
import { calculateAccuracy, getSharedRankByPoints } from "@/lib/ranking";
import { isGlobalPredictionLocked, isMatchLocked } from "@/lib/utils";
import MatchCard from "@/components/MatchCard";
import StatsCards from "@/components/StatsCards";
import MyPositionBanner from "@/components/MyPositionBanner";
import LiveRefresher from "@/components/LiveRefresher";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { MatchWithTeams, RankingEntry } from "@/types";
import type { PredictionResult } from "@prisma/client";

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

async function getHomeData(userId: string) {
  const today = getArgentinaDayRange();
  const [
    liveMatches,
    todayMatches,
    nextMatches,
    ranking,
    userRecord,
    correctCount,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
    myTodayPoints,
    groupTodayPoints,
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
      where: {
        groupId: { not: null },
        matchDate: { gte: today.start, lt: today.end },
      },
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
      where: { isAdmin: false, isBlocked: false },
      select: { id: true, name: true, image: true, totalPoints: true },
      orderBy: { totalPoints: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true } }),
    prisma.predictionPoints.count({ where: { userId, correct: true } }),
    prisma.prediction.count({ where: { userId } }),
    prisma.predictionPoints.count({ where: { userId } }),
    prisma.user.count({ where: { isAdmin: false, isBlocked: false } }),
    prisma.predictionPoints.count({
      where: {
        userId,
        correct: true,
        match: { matchDate: { gte: today.start, lt: today.end }, groupId: { not: null } },
      },
    }),
    prisma.predictionPoints.count({
      where: {
        correct: true,
        user: { isAdmin: false, isBlocked: false },
        match: { matchDate: { gte: today.start, lt: today.end }, groupId: { not: null } },
      },
    }),
  ]);

  const allMatches = [...liveMatches, ...todayMatches, ...nextMatches];
  const breakdowns = await getPredictionBreakdowns(Array.from(new Set(allMatches.map((m) => m.id))));

  const totalPoints = userRecord?.totalPoints ?? 0;
  const userRank = userRecord
    ? (await prisma.user.count({
        where: { isAdmin: false, isBlocked: false, totalPoints: { gt: totalPoints } },
      })) + 1
    : 0;

  return {
    liveMatches: liveMatches.map((match) => withPredictionBreakdown(match, breakdowns)),
    todayMatches: todayMatches.map((match) => withPredictionBreakdown(match, breakdowns)),
    nextMatches: nextMatches.map((match) => withPredictionBreakdown(match, breakdowns)),
    ranking,
    totalPoints,
    correctCount,
    userRank,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
    myTodayPoints,
    groupTodayPoints,
  };
}

function toMatchWithTeams(
  match: Awaited<ReturnType<typeof getHomeData>>["nextMatches"][number]
): MatchWithTeams {
  const prediction = match.predictions[0];
  return {
    ...match,
    isLocked: isMatchLocked(match.matchDate, match.status),
    myPrediction: prediction ? (prediction.prediction as PredictionResult) : null,
  } as MatchWithTeams;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((value) => value[0])
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
        <p className="text-sm text-slate-500">Error al cargar datos. Intenta de nuevo.</p>
      </div>
    );
  }

  const {
    liveMatches,
    todayMatches,
    nextMatches,
    ranking,
    totalPoints,
    correctCount,
    userRank,
    totalPredictions,
    resolvedPredictions,
    totalUsers,
    myTodayPoints,
    groupTodayPoints,
  } = homeData;

  const globalLocked = isGlobalPredictionLocked();
  const rankingDisplayRanks = ranking.map((_, index) => getSharedRankByPoints(ranking, index));
  const inTopVisible = ranking.some((user) => user.id === userId);
  const pendingPredictions = Math.max(totalPredictions - resolvedPredictions, 0);
  const finishedToday = todayMatches.filter((match) => match.status === "FINISHED").length;
  const liveOrTodayMatches = todayMatches.length > 0 ? todayMatches : liveMatches;
  const featuredMatches = liveOrTodayMatches.length > 0 ? liveOrTodayMatches : nextMatches.slice(0, 2);
  const topLeader = ranking[0] ?? null;
  const leaderGap = topLeader && topLeader.id !== userId ? Math.max(topLeader.totalPoints - totalPoints, 0) : 0;

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
    <div className="space-y-6">
      <LiveRefresher
        hasLive={liveMatches.length > 0}
        nextKickoffISO={nextMatches[0]?.matchDate.toISOString() ?? null}
      />

      <section
        className="relative overflow-hidden rounded-[2.15rem] border px-4 py-5 sm:px-6 sm:py-6"
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
        <div
          className="absolute -left-12 top-8 h-32 w-32 rounded-full blur-3xl"
          style={{ background: "rgba(245,158,11,0.14)" }}
        />
        <div
          className="absolute -right-12 top-6 h-36 w-36 rounded-full blur-3xl"
          style={{ background: "rgba(59,130,246,0.14)" }}
        />

        <div className="relative space-y-5">
          <div className="space-y-4">
            <span
              className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.26em]"
              style={{
                color: "var(--app-accent-strong)",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.16)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
              }}
            >
              Mundial 2026
            </span>

            <div className="max-w-[34rem] space-y-3">
              <h1 className="font-display text-[2.45rem] font-bold leading-[0.92] text-white sm:text-[3rem]">
                Prode <span style={{ color: "var(--app-accent-strong)" }}>Mundial 2026</span>
              </h1>
              <p className="max-w-[28rem] text-[0.92rem] leading-relaxed text-slate-300">
                Tus picks, la jornada y el ranking en una sola vista. Sin vueltas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href="/fixture"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full px-5 text-[0.88rem] font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #d6a44a 0%, #9a5f1d 100%)",
                  boxShadow: "0 16px 28px -16px rgba(214,164,74,0.78)",
                }}
              >
                Ver fixture
              </Link>
              <Link
                href="/ranking"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border px-5 text-[0.88rem] font-semibold transition-colors hover:[color:var(--app-text)]"
                style={{
                  background: "var(--app-panel-soft-bg)",
                  borderColor: "var(--app-border-strong)",
                  color: "var(--app-text-muted)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42)",
                }}
              >
                Ver ranking
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.72rem] font-semibold"
                style={{
                  background: "var(--app-panel-soft-bg)",
                  border: "1px solid var(--app-border)",
                  color: "var(--app-text-muted)",
                }}
              >
                {totalUsers} jugadores
              </span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.72rem] font-semibold"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.16)",
                  color: "var(--app-accent-strong)",
                }}
              >
                1 punto por acierto
              </span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.72rem] font-semibold"
                style={{
                  background: session.user.isPaid ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
                  border: session.user.isPaid
                    ? "1px solid rgba(16,185,129,0.16)"
                    : "1px solid rgba(245,158,11,0.16)",
                  color: session.user.isPaid ? "rgba(5,150,105,0.92)" : "var(--app-accent-strong)",
                }}
              >
                {session.user.isPaid ? "Grupo activo" : "Pago pendiente"}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tu campana
            </p>
            <StatsCards totalPoints={totalPoints} correctCount={correctCount} rank={userRank} />
          </div>

          <div
            className="rounded-[1.7rem] border px-4 py-4"
            style={{
              background: "var(--app-panel-bg)",
              borderColor: "var(--app-border)",
              boxShadow: "var(--app-panel-shadow)",
            }}
          >
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Ahora
                </p>
                <p className="mt-2 text-[1.1rem] font-semibold text-white">
                  {pendingPredictions > 0
                    ? `${pendingPredictions} picks tuyos siguen abiertos`
                    : "Ya no tenes picks pendientes por resolver"}
                </p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-slate-400">
                  {todayMatches.length > 0
                    ? `${finishedToday}/${todayMatches.length} partidos del dia ya quedaron cerrados.`
                    : liveMatches.length > 0
                      ? `${liveMatches.length} partidos estan moviendo la tabla ahora mismo.`
                      : "Entrando al fixture ves enseguida lo que sigue."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { eyebrow: "Hoy", value: `${finishedToday}/${todayMatches.length || 0}`, label: "cerrados" },
                  { eyebrow: "Grupo", value: `+${groupTodayPoints}`, label: "aciertos" },
                  { eyebrow: "Vos", value: `+${myTodayPoints}`, label: "sumados" },
                  { eyebrow: "Gap", value: `${leaderGap}`, label: leaderGap > 0 ? "al lider" : "punta" },
                ].map((stat) => (
                  <div
                    key={stat.eyebrow}
                    className="rounded-[1.2rem] border px-3 py-3"
                    style={{
                      background: "var(--app-panel-soft-bg)",
                      borderColor: "var(--app-border)",
                    }}
                  >
                    <p className="text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {stat.eyebrow}
                    </p>
                    <p className="mt-1 font-display text-[1.45rem] font-bold leading-none text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredMatches.length > 0 && (
        <SectionShell
          eyebrow={liveOrTodayMatches.length > 0 ? "En juego" : "Lo proximo"}
          title={todayMatches.length > 0 ? "Jornada de hoy" : liveMatches.length > 0 ? "Partidos en vivo" : "Siguiente parada"}
          href="/fixture"
          hrefLabel="Ver todos"
        >
          <div className="space-y-3">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={toMatchWithTeams(match)} isAuthenticated globalLocked={globalLocked} />
            ))}
          </div>
        </SectionShell>
      )}

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
              Nadie sumo puntos todavia
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Apenas terminen los primeros partidos, el ranking empieza a moverse.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/6 bg-black/10">
            {ranking.map((user, index) => {
              const isMe = user.id === userId;
              const displayRank = rankingDisplayRanks[index];
              const medals = ["1", "2", "3"];

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${index < ranking.length - 1 ? "border-b border-white/6" : ""} ${
                    isMe ? "bg-amber-400/[0.06]" : ""
                  }`}
                >
                  <span className="w-6 text-center text-sm">
                    {displayRank <= 3 ? (
                      <span className="font-display text-base text-amber-200">{medals[displayRank - 1]}</span>
                    ) : (
                      <span className="font-mono text-xs text-slate-500">{displayRank}</span>
                    )}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/7 bg-white/5 text-[10px] font-bold text-slate-300">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${isMe ? "text-amber-100" : "text-white"}`}>
                      {user.name ?? "Anonimo"}
                      {isMe && (
                        <span className="ml-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-amber-300/70">
                          vos
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[1.15rem] font-bold leading-none text-white">
                      {user.totalPoints}
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
