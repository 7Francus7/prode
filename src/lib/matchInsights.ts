import { prisma } from "@/lib/prisma";
import type { PredictionBreakdown } from "@/types";
import type { PredictionResult } from "@prisma/client";

const EMPTY_BREAKDOWN: PredictionBreakdown = {
  HOME: 0,
  DRAW: 0,
  AWAY: 0,
};

export function emptyPredictionBreakdown(): PredictionBreakdown {
  return { ...EMPTY_BREAKDOWN };
}

export async function getPredictionBreakdowns(
  matchIds: string[]
): Promise<Record<string, PredictionBreakdown>> {
  if (matchIds.length === 0) return {};

  const rows = await prisma.prediction.groupBy({
    by: ["matchId", "prediction"],
    where: {
      matchId: { in: matchIds },
      user: { isAdmin: false, isBlocked: false },
    },
    _count: { _all: true },
  });

  return rows.reduce<Record<string, PredictionBreakdown>>((acc, row) => {
    acc[row.matchId] ??= emptyPredictionBreakdown();
    acc[row.matchId][row.prediction as PredictionResult] = row._count._all;
    return acc;
  }, {});
}

export function withPredictionBreakdown<T extends { id: string }>(
  match: T,
  breakdowns: Record<string, PredictionBreakdown>
): T & { predictionBreakdown: PredictionBreakdown } {
  return {
    ...match,
    predictionBreakdown: breakdowns[match.id] ?? emptyPredictionBreakdown(),
  };
}
