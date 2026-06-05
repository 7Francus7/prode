import { prisma } from "./prisma";
import { env } from "./env";

export async function getPoolStats() {
  const eligibleWhere = { isPaid: true, isAdmin: false, isBlocked: false };
  const [paidUsersCount, leaders] = await Promise.all([
    prisma.user.count({ where: eligibleWhere }),
    prisma.user.findMany({
      where: eligibleWhere,
      select: { totalPoints: true },
      orderBy: { totalPoints: "desc" },
      take: 1,
    }),
  ]);
  const inscriptionAmount = env.INSCRIPTION_AMOUNT ?? 0;
  const totalPool = paidUsersCount * inscriptionAmount;
  const leaderPoints = leaders[0]?.totalPoints ?? null;
  const firstPlaceCount =
    leaderPoints === null
      ? 0
      : await prisma.user.count({
          where: { ...eligibleWhere, totalPoints: leaderPoints },
        });
  const prizePerWinner = firstPlaceCount > 0 ? totalPool / firstPlaceCount : 0;

  return { paidUsersCount, inscriptionAmount, totalPool, firstPlaceCount, prizePerWinner };
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
