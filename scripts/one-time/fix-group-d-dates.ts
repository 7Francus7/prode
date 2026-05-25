/**
 * ONE-TIME SCRIPT — Corrige los horarios del Grupo D al calendario oficial FIFA 2026.
 *
 * 3 partidos estaban corridos 1 h (verificado contra ticketeras oficiales —AXS,
 * SeatGeek, Ticketmaster— y los números de partido de FIFA):
 *   USA vs Paraguay      13/6 02:00Z → 01:00Z  (vie 12/6 18:00 PDT · SoFi, M4)
 *   Australia vs Turquía 14/6 05:00Z → 04:00Z  (sáb 13/6 21:00 PDT · Vancouver, M6)
 *   Paraguay vs Turquía  20/6 03:00Z → 04:00Z  (vie 19/6 21:00 PDT · Levi's, M31)
 *
 * NO borra predicciones (sólo updateMany sobre matchDate).
 * Uso: CONFIRM_FIX_GROUP_D=true npx tsx scripts/one-time/fix-group-d-dates.ts
 */

if (process.env.CONFIRM_FIX_GROUP_D !== "true") {
  console.error(
    "\n⛔  ABORTADO: script de corrección puntual.\n" +
    "    Para ejecutarlo:\n\n" +
    "      CONFIRM_FIX_GROUP_D=true npx tsx scripts/one-time/fix-group-d-dates.ts\n"
  );
  process.exit(1);
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIXES: { home: string; away: string; date: string }[] = [
  { home: "USA", away: "PAR", date: "2026-06-13T01:00:00Z" },
  { home: "AUS", away: "TUR", date: "2026-06-14T04:00:00Z" },
  { home: "PAR", away: "TUR", date: "2026-06-20T04:00:00Z" },
];

async function main() {
  console.log("Corrigiendo horarios del Grupo D (sin borrar predicciones)...\n");
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
