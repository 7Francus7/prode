import webPush from "web-push";
import type { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

function initVapid(): boolean {
  const pub = env.VAPID_PUBLIC_KEY;
  const priv = env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webPush.setVapidDetails(`mailto:${env.VAPID_EMAIL}`, pub, priv);
  return true;
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

async function sendPush(
  db: PrismaClient,
  subId: string,
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
) {
  try {
    await webPush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(payload)
    );
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) {
      // Subscription expired, clean it up.
      await db.pushSubscription.delete({ where: { id: subId } }).catch(() => {});
    }
  }
}

export async function sendMatchResultPush(
  db: PrismaClient,
  matchId: string
): Promise<void> {
  if (!initVapid()) return;

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match?.winner) return;

  const points = await db.predictionPoints.findMany({
    where: { matchId, user: { isBlocked: false } },
    select: { userId: true, correct: true },
  });

  const userIds = points.map((point) => point.userId);
  const subs = await db.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });

  const subsByUser = new Map(subs.map((sub) => [sub.userId, sub]));
  const correctByUser = new Map(points.map((point) => [point.userId, point.correct]));

  const home = match.homeTeam.code;
  const away = match.awayTeam.code;

  await Promise.allSettled(
    [...subsByUser.entries()].map(([userId, sub]) => {
      const correct = correctByUser.get(userId) ?? false;
      return sendPush(db, sub.id, sub.endpoint, sub.p256dh, sub.auth, {
        title: correct ? "¡Acertaste! ✓" : "Esta vez no fue",
        body: correct
          ? `Acertaste ${home} vs ${away}. Sumaste 1 punto.`
          : `No acertaste ${home} vs ${away}. Seguí participando.`,
        url: "/predictions",
      });
    })
  );
}

export async function sendGlobalLockReminder(db: PrismaClient): Promise<void> {
  if (!initVapid()) return;

  const subs = await db.pushSubscription.findMany({
    include: { user: { select: { isPaid: true, isBlocked: true } } },
  });

  await Promise.allSettled(
    subs
      .filter((sub) => sub.user.isPaid && !sub.user.isBlocked)
      .map((sub) =>
        sendPush(db, sub.id, sub.endpoint, sub.p256dh, sub.auth, {
          title: "¡Las predicciones cierran pronto!",
          body: "Asegurate de haber predicho todos los partidos del grupo.",
          url: "/fixture",
        })
      )
  );
}
