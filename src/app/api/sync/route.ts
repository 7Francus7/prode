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

  try {
    const service = new SyncService(createFootballApiProvider(), prisma);
    const result = await service.syncTodayMatches();
    return NextResponse.json(result);
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

  try {
    const service = new SyncService(createFootballApiProvider(), prisma);
    const result = full ? await service.syncAllMatches() : await service.syncLiveMatches();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[sync:admin] error:", error);
    return NextResponse.json({ error: "No se pudo sincronizar" }, { status: 500 });
  }
}
