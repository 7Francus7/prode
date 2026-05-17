import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyncService } from "@/services/syncService";
import { createFootballApiProvider } from "@/services/footballApi";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = new SyncService(createFootballApiProvider(), prisma);
  const result = await service.syncLiveMatches();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "true";

  const service = new SyncService(createFootballApiProvider(), prisma);
  const result = full ? await service.syncAllMatches() : await service.syncLiveMatches();
  return NextResponse.json(result);
}
