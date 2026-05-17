import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchStatus, PredictionResult } from "@prisma/client";
import { SyncService } from "@/services/syncService";
import { MockFootballProvider } from "@/services/footballApi";

function determineWinner(homeScore: number, awayScore: number): PredictionResult {
  if (homeScore > awayScore) return PredictionResult.HOME;
  if (awayScore > homeScore) return PredictionResult.AWAY;
  return PredictionResult.DRAW;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { homeScore, awayScore, status } = body as {
    homeScore?: number;
    awayScore?: number;
    status?: MatchStatus;
  };

  if (homeScore !== undefined && (typeof homeScore !== "number" || homeScore < 0 || !Number.isInteger(homeScore))) {
    return NextResponse.json({ error: "Score inválido" }, { status: 400 });
  }
  if (awayScore !== undefined && (typeof awayScore !== "number" || awayScore < 0 || !Number.isInteger(awayScore))) {
    return NextResponse.json({ error: "Score inválido" }, { status: 400 });
  }
  if (status && !Object.values(MatchStatus).includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  const newHomeScore = homeScore !== undefined ? homeScore : match.homeScore;
  const newAwayScore = awayScore !== undefined ? awayScore : match.awayScore;
  const newStatus = status ?? match.status;

  const winner =
    newStatus === MatchStatus.FINISHED && newHomeScore != null && newAwayScore != null
      ? determineWinner(newHomeScore, newAwayScore)
      : null;

  const updated = await prisma.match.update({
    where: { id },
    data: { homeScore: newHomeScore, awayScore: newAwayScore, status: newStatus, winner },
    include: { homeTeam: true, awayTeam: true, group: true },
  });

  if (newStatus === MatchStatus.FINISHED && winner && match.groupId) {
    // Delete existing points for this match before recalculating
    const existingPoints = await prisma.predictionPoints.findMany({ where: { matchId: id } });
    if (existingPoints.length > 0) {
      await prisma.predictionPoints.deleteMany({ where: { matchId: id } });
      const affectedUsers = [...new Set(existingPoints.map((p) => p.userId))];
      for (const userId of affectedUsers) {
        const agg = await prisma.predictionPoints.aggregate({
          where: { userId },
          _sum: { points: true },
        });
        await prisma.user.update({ where: { id: userId }, data: { totalPoints: agg._sum.points ?? 0 } });
      }
    }
    const svc = new SyncService(new MockFootballProvider(), prisma);
    await svc.calculatePoints(id);
  } else if (match.status === MatchStatus.FINISHED && newStatus !== MatchStatus.FINISHED) {
    // Reverted from finished — clear points
    const existingPoints = await prisma.predictionPoints.findMany({ where: { matchId: id } });
    if (existingPoints.length > 0) {
      await prisma.predictionPoints.deleteMany({ where: { matchId: id } });
      const affectedUsers = [...new Set(existingPoints.map((p) => p.userId))];
      for (const userId of affectedUsers) {
        const agg = await prisma.predictionPoints.aggregate({
          where: { userId },
          _sum: { points: true },
        });
        await prisma.user.update({ where: { id: userId }, data: { totalPoints: agg._sum.points ?? 0 } });
      }
    }
  }

  return NextResponse.json(updated);
}
