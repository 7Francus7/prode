import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyncService } from "@/services/syncService";
import { createFootballApiProvider } from "@/services/footballApi";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider =
    env.FOOTBALL_API_KEY && env.FOOTBALL_API_KEY !== "mock" ? "api-football" : "mock";

  try {
    const service = new SyncService(createFootballApiProvider(), prisma);

    // Sin partidos en juego ni por arrancar: no gastar cuota de API-Football.
    if (!(await service.hasActiveMatchWindow())) {
      return NextResponse.json({
        skipped: true,
        provider,
        synced: 0,
        updated: 0,
        pointsCalculated: 0,
        errors: [],
      });
    }

    const result = await service.syncTodayMatches();
    return NextResponse.json({ ...result, provider });
  } catch (error) {
    console.error("[sync:cron] error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "true";
  const live = searchParams.get("live") === "true";

  try {
    const service = new SyncService(createFootballApiProvider(), prisma);
    const result = full
      ? await service.syncAllMatches()
      : live
        ? await service.syncLiveMatches()
        : await service.syncTodayMatches();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[sync:admin] error:", error);
    return NextResponse.json({ error: "No se pudo sincronizar" }, { status: 500 });
  }
}
