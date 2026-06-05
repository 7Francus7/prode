import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchStatus } from "@prisma/client";
import {
  calculateMatchPredictionPoints,
  clearMatchPredictionPoints,
  determineWinner,
} from "@/lib/matchPoints";
import { z } from "zod";

const updateMatchSchema = z.object({
  homeScore: z.number().int().min(0, "Score inválido").optional(),
  awayScore: z.number().int().min(0, "Score inválido").optional(),
  status: z.nativeEnum(MatchStatus, {
    error: "Estado inválido",
  }).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = updateMatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
  }

  const { homeScore, awayScore, status } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  const newHomeScore = homeScore !== undefined ? homeScore : match.homeScore;
  const newAwayScore = awayScore !== undefined ? awayScore : match.awayScore;
  const newStatus = status ?? match.status;

  const winner =
    newStatus === MatchStatus.FINISHED && newHomeScore != null && newAwayScore != null
      ? determineWinner(newHomeScore, newAwayScore)
      : null;

  const updated = await prisma.match.update({
    where: { id },
    data: { homeScore: newHomeScore, awayScore: newAwayScore, status: newStatus, winner },
    include: { homeTeam: true, awayTeam: true, group: true },
  });

  if (match.status === MatchStatus.FINISHED || newStatus === MatchStatus.FINISHED) {
    await clearMatchPredictionPoints(prisma, id);
  }

  if (newStatus === MatchStatus.FINISHED && winner && match.groupId) {
    await calculateMatchPredictionPoints(prisma, id);
  }

  return NextResponse.json(updated);
}
