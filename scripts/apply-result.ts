/**
 * Aplica manualmente un resultado final y recalcula puntos, replicando la
 * lógica del sync. Uso: npx tsx scripts/apply-result.ts KOR CZE 2 1
 */
import { PrismaClient, MatchStatus } from "@prisma/client";
import { determineWinner, recalculateMatchPredictionPointsInTransaction } from "../src/lib/matchPoints";

const prisma = new PrismaClient();

async function main() {
  const [homeCode, awayCode, homeScoreRaw, awayScoreRaw] = process.argv.slice(2);
  const homeScore = Number(homeScoreRaw);
  const awayScore = Number(awayScoreRaw);
  if (!homeCode || !awayCode || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    throw new Error("Uso: npx tsx scripts/apply-result.ts HOME AWAY homeScore awayScore");
  }

  const match = await prisma.match.findFirst({
    where: { homeTeam: { code: homeCode }, awayTeam: { code: awayCode } },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match) throw new Error(`No se encontró ${homeCode} vs ${awayCode}`);

  const winner = determineWinner(homeScore, awayScore);

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: match.id },
      data: { status: MatchStatus.FINISHED, homeScore, awayScore, winner },
    });
    await recalculateMatchPredictionPointsInTransaction(tx, match.id);
  }, { timeout: 20_000 });

  const points = await prisma.predictionPoints.count({ where: { matchId: match.id, correct: true } });
  const total = await prisma.prediction.count({ where: { matchId: match.id } });
  console.log(
    `${homeCode} ${homeScore}-${awayScore} ${awayCode} → FINISHED, winner=${winner}. Aciertos: ${points}/${total} predicciones.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
