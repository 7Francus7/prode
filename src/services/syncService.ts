import { PrismaClient, MatchStatus, PredictionResult } from "@prisma/client";
import type { FootballApiProvider } from "./footballApi";
import type { SyncResult } from "@/types";

function determineWinner(homeScore: number, awayScore: number): PredictionResult {
  if (homeScore > awayScore) return PredictionResult.HOME;
  if (awayScore > homeScore) return PredictionResult.AWAY;
  return PredictionResult.DRAW;
}

export class SyncService {
  constructor(
    private api: FootballApiProvider,
    private db: PrismaClient
  ) {}

  async syncLiveMatches(): Promise<SyncResult> {
    return this.#syncMatches(await this.api.getLiveMatches());
  }

  async syncTodayMatches(): Promise<SyncResult> {
    return this.#syncMatches(await this.api.getTodayMatches());
  }

  async syncAllMatches(): Promise<SyncResult> {
    return this.#syncMatches(await this.api.getWorldCupMatches(2026));
  }

  async #syncMatches(
    externalMatches: Awaited<ReturnType<typeof this.api.getLiveMatches>>
  ): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, updated: 0, pointsCalculated: 0, errors: [] };
    result.synced = externalMatches.length;

    for (const ext of externalMatches) {
      try {
        const match = await this.db.match.findUnique({ where: { externalId: ext.externalId } });
        if (!match) continue;

        const newStatus =
          ext.status === "LIVE"
            ? MatchStatus.LIVE
            : ext.status === "FINISHED"
              ? MatchStatus.FINISHED
              : MatchStatus.SCHEDULED;

        const winner =
          newStatus === MatchStatus.FINISHED && ext.homeScore != null && ext.awayScore != null
            ? determineWinner(ext.homeScore, ext.awayScore)
            : null;

        const wasAlreadyFinished = !!match.winner;

        await this.db.match.update({
          where: { id: match.id },
          data: { status: newStatus, homeScore: ext.homeScore, awayScore: ext.awayScore, winner },
        });
        result.updated++;

        if (newStatus === MatchStatus.FINISHED && winner && !wasAlreadyFinished) {
          await this.calculatePoints(match.id);
          result.pointsCalculated++;
        }
      } catch (e) {
        result.errors.push(String(e));
      }
    }

    return result;
  }

  async calculatePoints(matchId: string): Promise<void> {
    const match = await this.db.match.findUniqueOrThrow({ where: { id: matchId } });
    if (!match.winner || !match.groupId) return;

    const predictions = await this.db.prediction.findMany({ where: { matchId } });

    await this.db.$transaction(async (tx) => {
      for (const pred of predictions) {
        const correct = pred.prediction === match.winner;
        await tx.predictionPoints.upsert({
          where: { predictionId: pred.id },
          create: {
            userId: pred.userId,
            matchId,
            predictionId: pred.id,
            points: correct ? 1 : 0,
            correct,
          },
          update: { points: correct ? 1 : 0, correct },
        });
      }

      const affectedUserIds = [...new Set(predictions.map((p) => p.userId))];
      for (const userId of affectedUserIds) {
        const agg = await tx.predictionPoints.aggregate({
          where: { userId },
          _sum: { points: true },
        });
        await tx.user.update({
          where: { id: userId },
          data: { totalPoints: agg._sum.points ?? 0 },
        });
      }
    });
  }

  async recalculateAllPoints(): Promise<void> {
    await this.db.predictionPoints.deleteMany();
    await this.db.user.updateMany({ data: { totalPoints: 0 } });

    const finishedMatches = await this.db.match.findMany({
      where: { status: MatchStatus.FINISHED, winner: { not: null }, groupId: { not: null } },
    });

    for (const match of finishedMatches) {
      await this.calculatePoints(match.id);
    }
  }
}
