import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildGroupStandings } from "@/lib/standings";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const group = await prisma.group.findUnique({
    where: { name },
    include: {
      teams: { select: { id: true, name: true, code: true, flagCode: true } },
      matches: {
        where: { status: "FINISHED" },
        select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, winner: true },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  return NextResponse.json(buildGroupStandings(group));
}
