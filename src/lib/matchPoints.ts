import { PrismaClient, PredictionResult } from "@prisma/client";

export function determineWinner(homeScore: number, awayScore: number): PredictionResult {
  if (homeScore > awayScore) return PredictionResult.HOME;
  if (awayScore > homeScore) return PredictionResult.AWAY;
  return PredictionResult.DRAW;
}

async function recalculateUserTotals(db: PrismaClient, userIds: string[]): Promise<void> {
  const affectedUserIds = [...new Set(userIds)];
  if (affectedUserIds.length === 0) return;

  await db.$transaction(async (tx) => {
    for (const userId of affectedUserIds) {
      const aggregate = await tx.predictionPoints.aggregate({
        where: { userId },
        _sum: { points: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalPoints: aggregate._sum.points ?? 0 },
      });
    }
  });
}

export async function clearMatchPredictionPoints(
  db: PrismaClient,
  matchId: string
): Promise<void> {
  const existingPoints = await db.predictionPoints.findMany({
    where: { matchId },
    select: { userId: true },
  });

  if (existingPoints.length === 0) return;

  await db.predictionPoints.deleteMany({ where: { matchId } });
  await recalculateUserTotals(
    db,
    existingPoints.map((point) => point.userId)
  );
}

export async function calculateMatchPredictionPoints(
  db: PrismaClient,
  matchId: string
): Promise<void> {
  const match = await db.match.findUniqueOrThrow({ where: { id: matchId } });
  if (!match.winner || !match.groupId) return;

  const predictions = await db.prediction.findMany({ where: { matchId } });

  await db.$transaction(async (tx) => {
    for (const prediction of predictions) {
      const correct = prediction.prediction === match.winner;

      await tx.predictionPoints.upsert({
        where: { predictionId: prediction.id },
        create: {
          userId: prediction.userId,
          matchId,
          predictionId: prediction.id,
          points: correct ? 1 : 0,
          correct,
        },
        update: { points: correct ? 1 : 0, correct },
      });
    }
  });

  await recalculateUserTotals(
    db,
    predictions.map((prediction) => prediction.userId)
  );
}
