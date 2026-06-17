import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPredictionBreakdowns, withPredictionBreakdown } from "@/lib/matchInsights";
import { buildGroupStandings } from "@/lib/standings";
import { isGlobalPredictionLocked, isMatchLocked } from "@/lib/utils";
import { redirect } from "next/navigation";
import FixtureClient from "./FixtureClient";
import type { MatchWithTeams } from "@/types";
import type { PredictionResult } from "@prisma/client";

const INITIAL_GROUP = "A";

function toMatchWithTeams(
  match: Awaited<ReturnType<typeof getFixtureData>>["matches"][number]
): MatchWithTeams {
  const prediction = match.predictions[0];

  return {
    ...match,
    isLocked: isMatchLocked(match.matchDate, match.status),
    myPrediction: prediction ? (prediction.prediction as PredictionResult) : null,
  } as MatchWithTeams;
}

async function getFixtureData(userId: string, groupName: string) {
  const [matches, group] = await Promise.all([
    prisma.match.findMany({
      where: { group: { name: groupName } },
      include: {
        homeTeam: true,
        awayTeam: true,
        group: true,
        predictions: { where: { userId }, take: 1 },
      },
      orderBy: { matchDate: "asc" },
    }),
    prisma.group.findUnique({
      where: { name: groupName },
      include: {
        teams: { select: { id: true, name: true, code: true, flagCode: true } },
        matches: {
          where: { status: "FINISHED" },
          select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, winner: true },
        },
      },
    }),
  ]);

  const breakdowns = await getPredictionBreakdowns(matches.map((match) => match.id));

  return {
    matches: matches.map((match) => withPredictionBreakdown(match, breakdowns)),
    standings: group ? buildGroupStandings(group) : [],
  };
}

export default async function FixturePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { matches, standings } = await getFixtureData(session.user.id, INITIAL_GROUP);

  return (
    <FixtureClient
      initialGroup={INITIAL_GROUP}
      initialMatches={matches.map(toMatchWithTeams)}
      initialStandings={standings}
      initialGlobalLocked={isGlobalPredictionLocked()}
    />
  );
}
