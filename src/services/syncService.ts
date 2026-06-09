import { PrismaClient, MatchStatus } from "@prisma/client";
import {
  calculateMatchPredictionPoints,
  determineWinner,
  recalculateMatchPredictionPointsInTransaction,
} from "@/lib/matchPoints";
import type { FootballApiProvider } from "./footballApi";
import type { SyncResult } from "@/types";
import { sendMatchResultPush } from "./pushService";

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

  async #findMatch(ext: Awaited<ReturnType<typeof this.api.getLiveMatches>>[0]) {
    const byId = await this.db.match.findUnique({ where: { externalId: ext.externalId } });
    if (byId) return byId;

    // Fallback: seeded matches use custom externalIds, so match by team code plus date ±2h.
    const [homeTeam, awayTeam] = await Promise.all([
      this.db.team.findUnique({ where: { code: ext.homeTeamCode } }),
      this.db.team.findUnique({ where: { code: ext.awayTeamCode } }),
    ]);
    if (!homeTeam || !awayTeam) return null;

    const windowStart = new Date(ext.matchDate.getTime() - 2 * 60 * 60 * 1000);
    const windowEnd = new Date(ext.matchDate.getTime() + 2 * 60 * 60 * 1000);

    const match = await this.db.match.findFirst({
      where: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        matchDate: { gte: windowStart, lte: windowEnd },
      },
    });

    if (match) {
      // Bind numeric API id so future syncs use the fast path.
      await this.db.match.update({ where: { id: match.id }, data: { externalId: ext.externalId } });
    }

    return match;
  }

  async #syncMatches(
    externalMatches: Awaited<ReturnType<typeof this.api.getLiveMatches>>
  ): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, updated: 0, pointsCalculated: 0, errors: [] };
    result.synced = externalMatches.length;

    for (const ext of externalMatches) {
      try {
        const match = await this.#findMatch(ext);
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
        const nextStadium = ext.stadium || match.stadium;
        const nextCity = ext.city || match.city;
        const nextCountry = ext.country || match.country;

        const wasPreviouslyFinished =
          match.status === MatchStatus.FINISHED &&
          match.winner !== null &&
          match.groupId !== null;
        const resultChanged =
          match.status !== newStatus ||
          match.homeScore !== ext.homeScore ||
          match.awayScore !== ext.awayScore ||
          match.winner !== winner ||
          match.matchDate.getTime() !== ext.matchDate.getTime() ||
          match.stadium !== nextStadium ||
          match.city !== nextCity ||
          match.country !== nextCountry;

        await this.db.$transaction(async (tx) => {
          await tx.match.update({
            where: { id: match.id },
            data: {
              matchDate: ext.matchDate,
              stadium: nextStadium,
              city: nextCity,
              country: nextCountry,
              status: newStatus,
              homeScore: ext.homeScore,
              awayScore: ext.awayScore,
              winner,
            },
          });

          if (
            wasPreviouslyFinished ||
            (newStatus === MatchStatus.FINISHED && winner && match.groupId && resultChanged)
          ) {
            await recalculateMatchPredictionPointsInTransaction(tx, match.id);
          }
        }, { timeout: 20_000 });
        result.updated++;

        if (newStatus === MatchStatus.FINISHED && winner && match.groupId && resultChanged) {
          result.pointsCalculated++;
          if (!wasPreviouslyFinished) {
            sendMatchResultPush(this.db, match.id).catch(() => {});
          }
        }
      } catch (error) {
        result.errors.push(String(error));
      }
    }

    return result;
  }

  async calculatePoints(matchId: string): Promise<void> {
    await calculateMatchPredictionPoints(this.db, matchId);
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
