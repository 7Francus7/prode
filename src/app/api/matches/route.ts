import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMatchLocked } from "@/lib/utils";
import type { MatchStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);

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
      ...(session?.user?.id
        ? { predictions: { where: { userId: session.user.id }, take: 1 } }
        : {}),
    },
    orderBy: { matchDate: "asc" },
    take: limit,
  });

  type MatchWithPreds = (typeof matches)[number] & {
    predictions?: { prediction: string }[];
  };

  return NextResponse.json(
    matches.map((m) => {
      const mWithPreds = m as MatchWithPreds;
      return {
        ...m,
        isLocked: isMatchLocked(m.matchDate, m.status),
        myPrediction: mWithPreds.predictions?.[0]?.prediction ?? null,
        predictions: undefined,
      };
    })
  );
}
