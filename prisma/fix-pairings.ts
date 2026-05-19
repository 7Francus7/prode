import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Group B: seed had [CAN, SUI, QAT, BIH] but correct order is [CAN, BIH, QAT, SUI]
// Group I: seed had [FRA, SEN, NOR, IRQ] but correct order is [FRA, SEN, IRQ, NOR]
// This fixes the 4 wrong match pairings per group WITHOUT deleting predictions.

const FIXES = [
  // Group B — 4 wrong pairings (MD1 x2, MD3 x2)
  { externalId: "GROUP_B_CAN_SUI", newHome: "CAN", newAway: "BIH", newExtId: "GROUP_B_CAN_BIH" },
  { externalId: "GROUP_B_QAT_BIH", newHome: "QAT", newAway: "SUI", newExtId: "GROUP_B_QAT_SUI" },
  { externalId: "GROUP_B_CAN_BIH", newHome: "CAN", newAway: "SUI", newExtId: "GROUP_B_CAN_SUI" },
  { externalId: "GROUP_B_SUI_QAT", newHome: "BIH", newAway: "QAT", newExtId: "GROUP_B_BIH_QAT" },
  // Group I — 4 wrong pairings (MD2 x2, MD3 x2)
  { externalId: "GROUP_I_FRA_NOR", newHome: "FRA", newAway: "IRQ", newExtId: "GROUP_I_FRA_IRQ" },
  { externalId: "GROUP_I_SEN_IRQ", newHome: "SEN", newAway: "NOR", newExtId: "GROUP_I_SEN_NOR" },
  { externalId: "GROUP_I_FRA_IRQ", newHome: "FRA", newAway: "NOR", newExtId: "GROUP_I_FRA_NOR" },
  { externalId: "GROUP_I_SEN_NOR", newHome: "SEN", newAway: "IRQ", newExtId: "GROUP_I_SEN_IRQ" },
];

async function main() {
  console.log("Fixing match pairings for Groups B and I...\n");

  // Load team IDs
  const codes = [...new Set(FIXES.flatMap((f) => [f.newHome, f.newAway]))];
  const teams = await prisma.team.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true },
  });
  const teamId = Object.fromEntries(teams.map((t) => [t.code, t.id]));

  for (const code of codes) {
    if (!teamId[code]) throw new Error(`Team ${code} not found in DB`);
  }
  console.log("Teams loaded:", codes.join(", "));

  // Find each match by current externalId and store its DB id
  const matchesToFix = await Promise.all(
    FIXES.map(async (fix) => {
      const match = await prisma.match.findUnique({
        where: { externalId: fix.externalId },
        select: { id: true, homeTeamId: true, awayTeamId: true, matchDate: true },
      });
      if (!match) {
        console.error(`  NOT FOUND: ${fix.externalId}`);
        return null;
      }
      return { ...fix, dbId: match.id, matchDate: match.matchDate };
    })
  );

  const valid = matchesToFix.filter(Boolean) as NonNullable<(typeof matchesToFix)[number]>[];
  if (valid.length !== FIXES.length) {
    throw new Error(`Only ${valid.length}/${FIXES.length} matches found. Aborting.`);
  }

  valid.forEach((m) => {
    const d = m.matchDate.toISOString().slice(0, 16).replace("T", " ");
    console.log(`  found ${m.externalId} → ${d} UTC`);
  });

  // Transaction: first null all externalIds (avoids unique constraint during swap),
  // then set correct teams + externalIds
  await prisma.$transaction(async (tx) => {
    // Step 1: clear externalIds
    for (const m of valid) {
      await tx.match.update({ where: { id: m.dbId }, data: { externalId: null } });
    }

    // Step 2: apply correct teams + externalId
    for (const m of valid) {
      await tx.match.update({
        where: { id: m.dbId },
        data: {
          homeTeamId: teamId[m.newHome],
          awayTeamId: teamId[m.newAway],
          externalId: m.newExtId,
        },
      });
      console.log(`  ✓ ${m.externalId} → ${m.newHome} vs ${m.newAway} (${m.newExtId})`);
    }
  });

  console.log(`\nDone. ${valid.length} matches fixed.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
