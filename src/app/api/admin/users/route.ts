import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isPaid: true,
      isAdmin: true,
      isSuperAdmin: true,
      isBlocked: true,
      totalPoints: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { predictions: true, predictionPoints: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
