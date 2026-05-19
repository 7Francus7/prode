import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys no configuradas" }, { status: 500 });
  }

  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "admin@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const body = await req.json() as { title?: string; message?: string; url?: string };
  const title = body.title ?? "Prode 2026";
  const message = body.message ?? "";
  const url = body.url ?? "/";

  const subs = await prisma.pushSubscription.findMany({
    include: { user: { select: { isPaid: true } } },
  });
  const paidSubs = subs.filter((s) => s.user.isPaid);

  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  await Promise.allSettled(
    paidSubs.map(async (s) => {
      try {
        await webPush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body: message, url })
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) expiredIds.push(s.id);
        failed++;
      }
    })
  );

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } }).catch(() => {});
  }

  return NextResponse.json({ sent, failed, total: paidSubs.length });
}
