import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { createFootballApiProvider } from "@/services/footballApi";
import { SyncService } from "@/services/syncService";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = new SyncService(createFootballApiProvider(), prisma);
    const result = await service.syncTodayMatches();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[cron:sync] error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
