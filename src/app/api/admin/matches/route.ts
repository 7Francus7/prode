import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MatchStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as MatchStatus | null;
  const group = searchParams.get("group");

  const matches = await prisma.match.findMany({
    where: {
      groupId: { not: null },
      ...(status ? { status } : {}),
      ...(group ? { group: { name: group } } : {}),
    },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { matchDate: "asc" },
  });

  return NextResponse.json(matches);
}
