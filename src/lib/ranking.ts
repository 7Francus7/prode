import type { RankingEntry } from "@/types";

type RankingUserCounts = {
  predictions: number;
  predictionPoints: number;
};

type RankingUser = {
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  predictionPoints: Array<{ id: string }>;
  _count: RankingUserCounts;
};

export function calculateAccuracy(
  correctPredictions: number,
  resolvedPredictions: number
): number | null {
  if (resolvedPredictions <= 0) return null;
  return Math.round((correctPredictions / resolvedPredictions) * 100);
}

export function getSharedRankByPoints(
  sortedItems: Array<{ totalPoints: number }>,
  index: number
): number {
  let rank = 1;

  for (let currentIndex = 1; currentIndex <= index; currentIndex++) {
    if (sortedItems[currentIndex].totalPoints !== sortedItems[currentIndex - 1].totalPoints) {
      rank = currentIndex + 1;
    }
  }

  return rank;
}

export function buildRankingEntries(users: RankingUser[]): RankingEntry[] {
  return users.map((user, index) => {
    const correctPredictions = user.predictionPoints.length;

    return {
      rank: getSharedRankByPoints(users, index),
      id: user.id,
      name: user.name,
      image: user.image,
      totalPoints: user.totalPoints,
      correctPredictions,
      totalPredictions: user._count.predictions,
      accuracy: calculateAccuracy(correctPredictions, user._count.predictionPoints),
    };
  });
}
