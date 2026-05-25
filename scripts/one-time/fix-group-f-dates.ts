/**
 * ONE-TIME SCRIPT — Corrige los horarios del Grupo F al calendario oficial FIFA 2026.
 *
 * 3 partidos estaban corridos 1 h (verificado contra ticketeras oficiales —Gametime,
 * TickPick, AT&T Stadium— y los números de partido de FIFA):
 *   Países Bajos vs Suecia 20/6 16:00Z → 17:00Z (sáb 20/6 12:00 CT · NRG Houston, M35)
 *   Japón vs Suecia        25/6 22:00Z → 23:00Z (jue 25/6 19:00 ET · AT&T Dallas, M57)
 *   Túnez vs Países Bajos  25/6 22:00Z → 23:00Z (jue 25/6 19:00 ET · Arrowhead KC)
 *
 * NO borra predicciones (sólo updateMany sobre matchDate).
 * Uso: CONFIRM_FIX_GROUP_F=true npx tsx scripts/one-time/fix-group-f-dates.ts
 */

if (process.env.CONFIRM_FIX_GROUP_F !== "true") {
  console.error(
    "\n⛔  ABORTADO: script de corrección puntual.\n" +
    "    Para ejecutarlo:\n\n" +
    "      CONFIRM_FIX_GROUP_F=true npx tsx scripts/one-time/fix-group-f-dates.ts\n"
  );
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIXES: { home: string; away: string; date: string }[] = [
  { home: "NED", away: "SWE", date: "2026-06-20T17:00:00Z" },
  { home: "JPN", away: "SWE", date: "2026-06-25T23:00:00Z" },
  { home: "NED", away: "TUN", date: "2026-06-25T23:00:00Z" },
];

async function main() {
  console.log("Corrigiendo horarios del Grupo F (sin borrar predicciones)...\n");
  for (const { home, away, date } of FIXES) {
    const [h, a] = await Promise.all([
      prisma.team.findUnique({ where: { code: home } }),
      prisma.team.findUnique({ where: { code: away } }),
    ]);
    if (!h || !a) {
      console.log(`  ✗ equipo no encontrado: ${home} o ${away}`);
      continue;
    }
    const res = await prisma.match.updateMany({
      where: { homeTeamId: h.id, awayTeamId: a.id },
      data: { matchDate: new Date(date) },
    });
    console.log(`  ${res.count > 0 ? "✓" : "✗"} ${home} vs ${away} → ${date} (${res.count} fila/s)`);
  }
  console.log("\nListo.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
