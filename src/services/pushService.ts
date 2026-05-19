import webPush from "web-push";
import type { PrismaClient } from "@prisma/client";

function initVapid(): boolean {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "admin@example.com"}`,
    pub,
    priv
  );
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
      // Subscription expired — clean up
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
    where: { matchId },
    select: { userId: true, correct: true },
  });

  const userIds = points.map((p) => p.userId);
  const subs = await db.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });

  const subsByUser = new Map(subs.map((s) => [s.userId, s]));
  const correctByUser = new Map(points.map((p) => [p.userId, p.correct]));

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
    include: { user: { select: { isPaid: true } } },
  });

  await Promise.allSettled(
    subs
      .filter((s) => s.user.isPaid)
      .map((s) =>
        sendPush(db, s.id, s.endpoint, s.p256dh, s.auth, {
          title: "¡Las predicciones cierran pronto!",
          body: "Asegurate de haber predicho todos los partidos del grupo.",
          url: "/fixture",
        })
      )
  );
}
