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
  _count: RankingUserCounts;
};

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
  return users.map((user, index) => ({
    rank: getSharedRankByPoints(users, index),
    id: user.id,
    name: user.name,
    image: user.image,
    totalPoints: user.totalPoints,
    correctPredictions: user._count.predictionPoints,
    totalPredictions: user._count.predictions,
    accuracy:
      user._count.predictions > 0
        ? Math.round((user._count.predictionPoints / user._count.predictions) * 100)
        : null,
  }));
}
