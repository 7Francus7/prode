import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";
import { env } from "@/lib/env";

const broadcastSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  message: z.string().trim().min(1, "El mensaje es requerido").max(240),
  url: z.string().startsWith("/", "La URL debe ser interna").max(200).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys no configuradas" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload inválido" }, { status: 400 });
  }

  webPush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  const title = parsed.data.title ?? "Prode 2026";
  const message = parsed.data.message;
  const url = parsed.data.url ?? "/";

  const subs = await prisma.pushSubscription.findMany({
    include: { user: { select: { isPaid: true } } },
  });
  const paidSubs = subs.filter((subscription) => subscription.user.isPaid);

  let sent = 0;
  let failed = 0;
  const expiredIds: string[] = [];

  await Promise.allSettled(
    paidSubs.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({ title, body: message, url })
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) expiredIds.push(subscription.id);
        failed++;
      }
    })
  );

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } }).catch(() => {});
  }

  return NextResponse.json({ sent, failed, total: paidSubs.length });
}
