import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyncService } from "@/services/syncService";
import { MockFootballProvider } from "@/services/footballApi";

export async function POST() {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const svc = new SyncService(new MockFootballProvider(), prisma);
  await svc.recalculateAllPoints();

  const userCount = await prisma.user.count({ where: { totalPoints: { gt: 0 }, isBlocked: false } });
  return NextResponse.json({ ok: true, usersUpdated: userCount });
}
