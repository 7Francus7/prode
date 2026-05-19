import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RankingEntry } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        name: true,
        image: true,
        totalPoints: true,
        _count: {
          select: {
            predictions: true,
            predictionPoints: { where: { correct: true } },
          },
        },
      },
      orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
      take: 200,
    });

    const ranking: RankingEntry[] = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      name: u.name,
      image: u.image,
      totalPoints: u.totalPoints,
      correctPredictions: u._count.predictionPoints,
      totalPredictions: u._count.predictions,
      accuracy:
        u._count.predictions > 0
          ? Math.round((u._count.predictionPoints / u._count.predictions) * 100)
          : null,
    }));

    return NextResponse.json(ranking);
  } catch (err) {
    console.error("[ranking] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
