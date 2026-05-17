import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type StandingEntry = {
  team: { id: string; name: string; code: string; flagCode: string };
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

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

  if (!group) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });

  type Tally = { w: number; d: number; l: number; gf: number; ga: number };
  const tally: Record<string, Tally> = {};
  for (const t of group.teams) tally[t.id] = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };

  for (const m of group.matches) {
    if (m.homeScore == null || m.awayScore == null || !m.winner) continue;
    const h = tally[m.homeTeamId];
    const a = tally[m.awayTeamId];
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.winner === "HOME")      { h.w++; a.l++; }
    else if (m.winner === "AWAY") { a.w++; h.l++; }
    else                          { h.d++; a.d++; }
  }

  const standings: StandingEntry[] = group.teams
    .map((t) => {
      const s = tally[t.id];
      return {
        team: t,
        mp: s.w + s.d + s.l,
        w: s.w, d: s.d, l: s.l,
        gf: s.gf, ga: s.ga,
        gd: s.gf - s.ga,
        pts: s.w * 3 + s.d,
      };
    })
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));

  return NextResponse.json(standings);
}
