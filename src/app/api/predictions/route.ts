import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMatchLocked, isGlobalPredictionLocked } from "@/lib/utils";
import { PredictionResult } from "@prisma/client";
import { z } from "zod";

const createPredictionSchema = z.object({
  matchId: z.string().min(1, "Partido inválido"),
  prediction: z.nativeEnum(PredictionResult, {
    error: "Predicción inválida",
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Payment gate — admins bypass
  if (!session.user.isPaid && !session.user.isAdmin) {
    return NextResponse.json({ error: "Pago pendiente de confirmación" }, { status: 403 });
  }

  // Global lock — admins bypass
  if (isGlobalPredictionLocked() && !session.user.isAdmin) {
    return NextResponse.json({ error: "Las predicciones han cerrado" }, { status: 403 });
  }

  const parsed = createPredictionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Predicción inválida" }, { status: 400 });
  }

  const { matchId, prediction } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  }

  if (!match.groupId) {
    return NextResponse.json({ error: "Solo se puede predecir la fase de grupos" }, { status: 403 });
  }

  if (isMatchLocked(match.matchDate, match.status) && !session.user.isAdmin) {
    return NextResponse.json({ error: "El partido ya comenzó" }, { status: 403 });
  }

  const result = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    create: { userId: session.user.id, matchId, prediction },
    update: { prediction, updatedAt: new Date() },
  });

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");

  const predictions = await prisma.prediction.findMany({
    where: {
      userId: session.user.id,
      ...(filter === "correct"
        ? { predictionPoints: { correct: true } }
        : filter === "wrong"
          ? { predictionPoints: { correct: false } }
          : filter === "pending"
            ? { predictionPoints: null }
            : {}),
    },
    include: {
      match: { include: { homeTeam: true, awayTeam: true, group: true } },
      predictionPoints: true,
    },
    orderBy: { match: { matchDate: "desc" } },
  });

  return NextResponse.json(predictions);
}
