import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.isBlocked) {
    return NextResponse.json({ error: "Cuenta bloqueada" }, { status: 403 });
  }

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    select: { groupId: true },
  });

  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  if (!match.groupId) {
    return NextResponse.json({ error: "Partido sin predicciones" }, { status: 404 });
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId: id, user: { isAdmin: false, isBlocked: false } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      predictionPoints: { select: { correct: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    predictions.map((p) => ({
      userId: p.userId,
      name: p.user.name,
      image: p.user.image,
      prediction: p.prediction,
      correct: p.predictionPoints?.correct ?? null,
    }))
  );
}
