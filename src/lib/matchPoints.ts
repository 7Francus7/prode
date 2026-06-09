import { Prisma, PrismaClient, PredictionResult } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export function determineWinner(homeScore: number, awayScore: number): PredictionResult {
  if (homeScore > awayScore) return PredictionResult.HOME;
  if (awayScore > homeScore) return PredictionResult.AWAY;
  return PredictionResult.DRAW;
}

async function recalculateUserTotals(db: DbClient, userIds: string[]): Promise<void> {
  const affectedUserIds = [...new Set(userIds)];
  if (affectedUserIds.length === 0) return;

  for (const userId of affectedUserIds) {
    const aggregate = await db.predictionPoints.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    await db.user.update({
      where: { id: userId },
      data: { totalPoints: aggregate._sum.points ?? 0 },
    });
  }
}

export async function recalculateMatchPredictionPointsInTransaction(
  db: Prisma.TransactionClient,
  matchId: string
): Promise<void> {
  const existingPoints = await db.predictionPoints.findMany({
    where: { matchId },
    select: { userId: true },
  });
  const match = await db.match.findUniqueOrThrow({ where: { id: matchId } });
  const predictions = await db.prediction.findMany({ where: { matchId } });

  await db.predictionPoints.deleteMany({ where: { matchId } });

  if (match.winner && match.groupId) {
    for (const prediction of predictions) {
      const correct = prediction.prediction === match.winner;

      await db.predictionPoints.create({
        data: {
          userId: prediction.userId,
          matchId,
          predictionId: prediction.id,
          points: correct ? 1 : 0,
          correct,
        },
      });
    }
  }

  await recalculateUserTotals(db, [
    ...existingPoints.map((point) => point.userId),
    ...predictions.map((prediction) => prediction.userId),
  ]);
}

export async function clearMatchPredictionPoints(
  db: PrismaClient,
  matchId: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    const existingPoints = await tx.predictionPoints.findMany({
      where: { matchId },
      select: { userId: true },
    });

    if (existingPoints.length === 0) return;

    await tx.predictionPoints.deleteMany({ where: { matchId } });
    await recalculateUserTotals(
      tx,
      existingPoints.map((point) => point.userId)
    );
  }, { timeout: 20_000 });
}

export async function calculateMatchPredictionPoints(
  db: PrismaClient,
  matchId: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    await recalculateMatchPredictionPointsInTransaction(tx, matchId);
  }, { timeout: 20_000 });
}
