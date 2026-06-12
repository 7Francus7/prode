import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: new Date("2026-06-11T00:00:00Z"),
        lte: new Date("2026-06-13T23:59:59Z"),
      },
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { matchDate: "asc" },
  });

  for (const m of matches) {
    console.log(
      `${m.homeTeam.code} vs ${m.awayTeam.code} | ${m.matchDate.toISOString()} | status=${m.status} | score=${m.homeScore}-${m.awayScore} | winner=${m.winner} | externalId=${m.externalId}`
    );
  }
}

main().finally(() => prisma.$disconnect());
