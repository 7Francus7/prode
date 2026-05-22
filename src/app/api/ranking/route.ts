import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRankingEntries } from "@/lib/ranking";

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
        predictionPoints: {
          where: { correct: true },
          select: { id: true },
        },
        _count: {
          select: {
            predictions: true,
            predictionPoints: true,
          },
        },
      },
      orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
      take: 200,
    });

    return NextResponse.json(buildRankingEntries(users));
  } catch (err) {
    console.error("[ranking] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
