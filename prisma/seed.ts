import { MatchStatus, PrismaClient } from "@prisma/client";
import { createGroupStageMatches, GROUPS, TEAMS } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding World Cup 2026 group-stage data...");

  await prisma.predictionPoints.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.group.deleteMany();
  console.log("Cleared existing data");

  const groupMap: Record<string, string> = {};
  for (const groupSeed of GROUPS) {
    const group = await prisma.group.create({ data: groupSeed });
    groupMap[groupSeed.name] = group.id;
  }
  console.log(`${GROUPS.length} groups created`);

  const teamMap: Record<string, string> = {};
  for (const teamSeed of TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: teamSeed.name,
        code: teamSeed.code,
        flagCode: teamSeed.flagCode,
        groupId: groupMap[teamSeed.group],
      },
    });
    teamMap[teamSeed.code] = team.id;
  }
  console.log(`${TEAMS.length} teams created`);

  const groupStageMatches = createGroupStageMatches();
  for (const matchSeed of groupStageMatches) {
    await prisma.match.create({
      data: {
        homeTeamId: teamMap[matchSeed.home],
        awayTeamId: teamMap[matchSeed.away],
        groupId: groupMap[matchSeed.group],
        matchDate: new Date(matchSeed.date),
        stadium: "Por confirmar",
        city: "",
        country: "",
        status: MatchStatus.SCHEDULED,
        round: matchSeed.round,
        externalId: matchSeed.externalId,
      },
    });
  }

  console.log(`${groupStageMatches.length} group-stage matches created`);
  console.log(`Seed complete. Total matches: ${groupStageMatches.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
