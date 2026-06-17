import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPredictionBreakdowns, withPredictionBreakdown } from "@/lib/matchInsights";
import { isMatchLocked } from "@/lib/utils";
import type { MatchStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const userId = session?.user?.id && !session.user.isBlocked ? session.user.id : null;

  const group = searchParams.get("group");
  const round = searchParams.get("round");
  const status = searchParams.get("status") as MatchStatus | null;
  const upcoming = searchParams.get("upcoming") === "true";
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const matches = await prisma.match.findMany({
    where: {
      groupId: { not: null },
      ...(group ? { group: { name: group } } : {}),
      ...(round ? { round } : {}),
      ...(status ? { status } : {}),
      ...(upcoming ? { matchDate: { gte: new Date() }, status: "SCHEDULED" } : {}),
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      group: true,
      ...(userId
        ? { predictions: { where: { userId }, take: 1 } }
        : {}),
    },
    orderBy: { matchDate: "asc" },
    take: limit,
  });

  type MatchWithPreds = (typeof matches)[number] & {
    predictions?: { prediction: string }[];
  };

  const breakdowns = await getPredictionBreakdowns(matches.map((match) => match.id));

  return NextResponse.json(
    matches.map((m) => {
      const mWithPreds = m as MatchWithPreds;
      return {
        ...withPredictionBreakdown(m, breakdowns),
        isLocked: isMatchLocked(m.matchDate, m.status),
        myPrediction: mWithPreds.predictions?.[0]?.prediction ?? null,
        predictions: undefined,
      };
    })
  );
}
