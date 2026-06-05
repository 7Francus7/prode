import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";
import { env } from "@/lib/env";

export async function POST() {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys no configuradas" }, { status: 500 });
  }

  webPush.setVapidDetails(
    `mailto:${env.VAPID_EMAIL}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No tenés una suscripción activa" }, { status: 404 });
  }

  const expiredIds: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
          JSON.stringify({
            title: "Test de push ✓",
            body: "Las notificaciones funcionan correctamente.",
            url: "/",
          })
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) expiredIds.push(subscription.id);
      }
    })
  );

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } }).catch(() => {});
  }

  if (sent === 0) {
    return NextResponse.json(
      { error: "Tus suscripciones activas expiraron. Volvé a activar notificaciones." },
      { status: 410 }
    );
  }

  return NextResponse.json({ ok: true, sent });
}
