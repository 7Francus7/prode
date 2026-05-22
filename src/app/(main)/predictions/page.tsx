import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PredictionsClient from "./PredictionsClient";

export default async function PredictionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
    include: {
      match: { include: { homeTeam: true, awayTeam: true, group: true } },
      predictionPoints: true,
    },
    orderBy: { match: { matchDate: "desc" } },
  });

  return <PredictionsClient initialPredictions={predictions} />;
}
