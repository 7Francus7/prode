import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find QA groups
  const qaGroups = await prisma.group.findMany({
    where: { name: { startsWith: "QA-" } },
    select: { id: true, name: true },
  });

  if (qaGroups.length === 0) {
    console.log("No QA data found in DB.");
    return;
  }

  console.log(`Found ${qaGroups.length} QA group(s):`, qaGroups.map((g) => g.name));

  const qaGroupIds = qaGroups.map((g) => g.id);

  // Find QA matches
  const qaMatches = await prisma.match.findMany({
    where: { groupId: { in: qaGroupIds } },
    select: { id: true, externalId: true },
  });
  const qaMatchIds = qaMatches.map((m) => m.id);
  console.log(`Found ${qaMatches.length} QA match(es).`);

  // Find QA teams
  const qaTeams = await prisma.team.findMany({
    where: { groupId: { in: qaGroupIds } },
    select: { id: true, name: true },
  });
  const qaTeamIds = qaTeams.map((t) => t.id);
  console.log(`Found ${qaTeams.length} QA team(s).`);

  // Find QA users
  const qaUsers = await prisma.user.findMany({
    where: { email: { contains: "@example.com" }, name: { startsWith: "QA " } },
    select: { id: true, email: true },
  });
  const qaUserIds = qaUsers.map((u) => u.id);
  console.log(`Found ${qaUsers.length} QA user(s).`);

  // Delete in dependency order
  if (qaUserIds.length > 0) {
    const ps = await prisma.pushSubscription.deleteMany({ where: { userId: { in: qaUserIds } } });
    console.log(`Deleted ${ps.count} push subscription(s).`);
    const pp = await prisma.predictionPoints.deleteMany({ where: { userId: { in: qaUserIds } } });
    console.log(`Deleted ${pp.count} predictionPoints.`);
  }

  if (qaMatchIds.length > 0) {
    const pred = await prisma.prediction.deleteMany({ where: { matchId: { in: qaMatchIds } } });
    console.log(`Deleted ${pred.count} prediction(s).`);
    const matches = await prisma.match.deleteMany({ where: { id: { in: qaMatchIds } } });
    console.log(`Deleted ${matches.count} match(es).`);
  }

  if (qaTeamIds.length > 0) {
    const teams = await prisma.team.deleteMany({ where: { id: { in: qaTeamIds } } });
    console.log(`Deleted ${teams.count} team(s).`);
  }

  const groups = await prisma.group.deleteMany({ where: { id: { in: qaGroupIds } } });
  console.log(`Deleted ${groups.count} group(s).`);

  if (qaUserIds.length > 0) {
    const users = await prisma.user.deleteMany({ where: { id: { in: qaUserIds } } });
    console.log(`Deleted ${users.count} user(s).`);
  }

  console.log("QA cleanup complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
