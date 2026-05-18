import { prisma } from "./prisma";

export async function getPoolStats() {
  const paidUsersCount = await prisma.user.count({ where: { isPaid: true, isAdmin: false } });
  const inscriptionAmount = Number(process.env.INSCRIPTION_AMOUNT ?? "0");
  const totalPool = paidUsersCount * inscriptionAmount;
  return { paidUsersCount, inscriptionAmount, totalPool };
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
