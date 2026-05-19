import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";

export async function POST() {
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

  const sub = await prisma.pushSubscription.findFirst({
    where: { userId: session.user.id },
  });

  if (!sub) {
    return NextResponse.json({ error: "No tenés una suscripción activa" }, { status: 404 });
  }

  try {
    await webPush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title: "Test de push ✓", body: "Las notificaciones funcionan correctamente.", url: "/" })
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      return NextResponse.json({ error: "Suscripción expirada, volvé a activar notificaciones" }, { status: 410 });
    }
    return NextResponse.json({ error: "Error al enviar notificación" }, { status: 500 });
  }
}
