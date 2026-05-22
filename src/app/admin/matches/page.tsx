import { prisma } from "@/lib/prisma";
import AdminMatchesClient from "./AdminMatchesClient";

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    where: { group: { name: "A" } },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { matchDate: "asc" },
  });

  return <AdminMatchesClient initialMatches={matches} />;
}
