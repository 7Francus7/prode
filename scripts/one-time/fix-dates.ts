/**
 * ONE-TIME SCRIPT — Fix group stage match dates to official FIFA 2026 schedule.
 * Already executed on 2026-05-19. Do NOT run again unless dates change.
 *
 * Usage: CONFIRM_FIX_DATES=true npx tsx scripts/one-time/fix-dates.ts
 */

if (process.env.CONFIRM_FIX_DATES !== "true") {
  console.error(
    "\n⛔  ABORTED: This is a one-time destructive script.\n" +
    "    It was already executed on 2026-05-19.\n" +
    "    If you really need to run it again, set:\n\n" +
    "      CONFIRM_FIX_DATES=true npx tsx scripts/one-time/fix-dates.ts\n"
  );
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROUP_TEAMS: Record<string, [string, string, string, string]> = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "SUI", "QAT", "BIH"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "NOR", "IRQ"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
};

const GROUP_MATCHDAYS: Record<string, { md1: [string, string]; md2: [string, string]; md3: string }> = {
  A: { md1: ["2026-06-11T19:00:00Z", "2026-06-12T02:00:00Z"], md2: ["2026-06-19T01:00:00Z", "2026-06-18T16:00:00Z"], md3: "2026-06-25T01:00:00Z" },
  B: { md1: ["2026-06-12T19:00:00Z", "2026-06-13T19:00:00Z"], md2: ["2026-06-18T22:00:00Z", "2026-06-18T19:00:00Z"], md3: "2026-06-24T19:00:00Z" },
  C: { md1: ["2026-06-13T22:00:00Z", "2026-06-14T01:00:00Z"], md2: ["2026-06-20T00:30:00Z", "2026-06-19T22:00:00Z"], md3: "2026-06-24T22:00:00Z" },
  D: { md1: ["2026-06-13T02:00:00Z", "2026-06-14T05:00:00Z"], md2: ["2026-06-19T19:00:00Z", "2026-06-20T03:00:00Z"], md3: "2026-06-26T02:00:00Z" },
  E: { md1: ["2026-06-14T17:00:00Z", "2026-06-14T23:00:00Z"], md2: ["2026-06-20T20:00:00Z", "2026-06-21T00:00:00Z"], md3: "2026-06-25T20:00:00Z" },
  F: { md1: ["2026-06-14T20:00:00Z", "2026-06-15T02:00:00Z"], md2: ["2026-06-20T16:00:00Z", "2026-06-21T04:00:00Z"], md3: "2026-06-25T22:00:00Z" },
  G: { md1: ["2026-06-15T19:00:00Z", "2026-06-16T01:00:00Z"], md2: ["2026-06-21T19:00:00Z", "2026-06-22T01:00:00Z"], md3: "2026-06-27T03:00:00Z" },
  H: { md1: ["2026-06-15T16:00:00Z", "2026-06-15T22:00:00Z"], md2: ["2026-06-21T16:00:00Z", "2026-06-21T22:00:00Z"], md3: "2026-06-27T00:00:00Z" },
  I: { md1: ["2026-06-16T19:00:00Z", "2026-06-16T22:00:00Z"], md2: ["2026-06-22T21:00:00Z", "2026-06-23T00:00:00Z"], md3: "2026-06-26T19:00:00Z" },
  J: { md1: ["2026-06-17T01:00:00Z", "2026-06-17T04:00:00Z"], md2: ["2026-06-22T17:00:00Z", "2026-06-23T03:00:00Z"], md3: "2026-06-28T02:00:00Z" },
  K: { md1: ["2026-06-17T17:00:00Z", "2026-06-18T02:00:00Z"], md2: ["2026-06-23T17:00:00Z", "2026-06-24T02:00:00Z"], md3: "2026-06-27T23:30:00Z" },
  L: { md1: ["2026-06-17T20:00:00Z", "2026-06-17T23:00:00Z"], md2: ["2026-06-23T20:00:00Z", "2026-06-23T23:00:00Z"], md3: "2026-06-27T21:00:00Z" },
};

async function updateMatchDate(homeCode: string, awayCode: string, date: string) {
  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.findUnique({ where: { code: homeCode } }),
    prisma.team.findUnique({ where: { code: awayCode } }),
  ]);
  if (!homeTeam || !awayTeam) {
    console.log(`  SKIP: team not found ${homeCode} or ${awayCode}`);
    return;
  }
  const result = await prisma.match.updateMany({
    where: { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id },
    data: { matchDate: new Date(date) },
  });
  const newDate = new Date(date).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  console.log(`  ${result.count > 0 ? "✓" : "✗"} ${homeCode} vs ${awayCode} → ${newDate}`);
}

async function main() {
  console.log("Updating match dates (no predictions deleted)...\n");
  let total = 0;
  for (const [group, teams] of Object.entries(GROUP_TEAMS)) {
    const [t0, t1, t2, t3] = teams;
    const { md1, md2, md3 } = GROUP_MATCHDAYS[group];
    console.log(`Group ${group}:`);
    await updateMatchDate(t0, t1, md1[0]); total++;
    await updateMatchDate(t2, t3, md1[1]); total++;
    await updateMatchDate(t0, t2, md2[0]); total++;
    await updateMatchDate(t1, t3, md2[1]); total++;
    await updateMatchDate(t0, t3, md3);    total++;
    await updateMatchDate(t1, t2, md3);    total++;
  }
  console.log(`\nDone. ${total} matches processed.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
