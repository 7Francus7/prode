import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const password = "qa-smoke-123456";
const runId = Date.now().toString(36);
const port = 3100 + Math.floor(Math.random() * 200);
const baseUrl = `http://localhost:${port}`;

type CookieJar = Map<string, string>;

class HttpClient {
  private cookies: CookieJar = new Map();

  async get(path: string, init?: RequestInit) {
    return this.request(path, { ...init, method: "GET" });
  }

  async post(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async patch(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async delete(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async postForm(path: string, body: URLSearchParams, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(init?.headers ?? {}),
      },
      body: body.toString(),
    });
  }

  private async request(path: string, init: RequestInit) {
    const headers = new Headers(init.headers ?? {});
    const cookieHeader = this.cookieHeader();
    if (cookieHeader) headers.set("cookie", cookieHeader);

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      redirect: "manual",
    });

    this.storeCookies(response);

    const text = await response.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return { response, text, json };
  }

  private cookieHeader(): string {
    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  private storeCookies(response: Response) {
    for (const cookie of response.headers.getSetCookie()) {
      const [nameValue] = cookie.split(";");
      const [name, value] = nameValue.split("=");
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/login`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // Server still booting.
    }

    await delay(1000);
  }

  throw new Error("Server did not start on time");
}

function startServer(extraEnv: Record<string, string> = {}): ChildProcess {
  const nextBin = fileURLToPath(
    new URL("../node_modules/next/dist/bin/next", import.meta.url)
  );

  const child = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...extraEnv,
      NEXTAUTH_URL: baseUrl,
      AUTH_TRUST_HOST: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
    }
  );

  child.stdout?.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
  child.stderr?.on("data", (chunk) => process.stderr.write(`[next] ${chunk}`));

  return child;
}

async function loginWithCredentials(client: HttpClient, email: string) {
  const csrf = await client.get("/api/auth/csrf");
  assert(csrf.response.ok, `Failed to load CSRF token: ${csrf.response.status}`);

  const token = (csrf.json as { csrfToken?: string } | null)?.csrfToken;
  assert(token, "Missing CSRF token");

  const form = new URLSearchParams({
    csrfToken: token,
    email,
    password,
    callbackUrl: `${baseUrl}/`,
    json: "true",
  });

  const login = await client.postForm("/api/auth/callback/credentials", form);
  assert(login.response.status === 200 || login.response.status === 302, `Login failed: ${login.response.status}`);

  const session = await client.get("/api/auth/session");
  const sessionUser = (session.json as { user?: { email?: string } } | null)?.user;
  assert(sessionUser?.email === email.toLowerCase(), `Unexpected session user for ${email}`);
}

async function main() {
  const unpaidEmail = `qa-unpaid-${runId}@example.com`;
  const challengerEmail = `qa-challenger-${runId}@example.com`;
  const adminEmail = `qa-admin-${runId}@example.com`;
  const unpaidName = `QA Unpaid ${runId}`;
  const challengerName = `QA Challenger ${runId}`;
  const adminName = `QA Admin ${runId}`;
  const fakeEndpoint = `https://example.com/push/${runId}`;

  const hashed = await bcrypt.hash(password, 10);

  const qaGroup = await prisma.group.create({
    data: { name: `QA-${runId}`, label: `QA ${runId}` },
  });

  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: `QA Home ${runId}`,
        code: `QH${runId.slice(-4)}`.slice(0, 8),
        flagCode: "ar",
        groupId: qaGroup.id,
      },
    }),
    prisma.team.create({
      data: {
        name: `QA Away ${runId}`,
        code: `QA${runId.slice(-4)}`.slice(0, 8),
        flagCode: "br",
        groupId: qaGroup.id,
      },
    }),
  ]);

  const match = await prisma.match.create({
    data: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      groupId: qaGroup.id,
      matchDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      stadium: "QA Stadium",
      city: "QA City",
      country: "QA Country",
      round: qaGroup.label,
      status: "SCHEDULED",
      externalId: `QA_MATCH_${runId}`,
    },
  });

  const globalLockMatch = await prisma.match.create({
    data: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      groupId: qaGroup.id,
      matchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      stadium: "QA Global Lock Stadium",
      city: "QA City",
      country: "QA Country",
      round: qaGroup.label,
      status: "SCHEDULED",
      externalId: `QA_GLOBAL_LOCK_MATCH_${runId}`,
    },
  });

  const kickoffLockMatch = await prisma.match.create({
    data: {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      groupId: qaGroup.id,
      matchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      stadium: "QA Kickoff Lock Stadium",
      city: "QA City",
      country: "QA Country",
      round: qaGroup.label,
      status: "SCHEDULED",
      externalId: `QA_KICKOFF_LOCK_MATCH_${runId}`,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      isAdmin: true,
      isPaid: false,
    },
  });

  await prisma.user.create({
    data: {
      name: challengerName,
      email: challengerEmail,
      password: hashed,
      isPaid: true,
    },
  });

  let server = startServer({ PRODE_GLOBAL_LOCK_ISO: "2099-01-01T00:00:00Z" });

  try {
    await waitForServer();
    console.log(`QA smoke server ready on ${baseUrl}`);

    const anon = new HttpClient();
    const unpaid = new HttpClient();
    const challenger = new HttpClient();
    const admin = new HttpClient();

    console.log("Checking unauthenticated redirect");
    const redirectHome = await anon.get("/");
    assert(redirectHome.response.status === 307, `Expected unauth redirect, got ${redirectHome.response.status}`);
    assert(redirectHome.response.headers.get("location")?.includes("/login"), "Unauth redirect should point to /login");

    console.log("Registering unpaid user");
    const register = await anon.post("/api/auth/register", {
      name: unpaidName,
      email: unpaidEmail.toUpperCase(),
      password,
    });
    assert(register.response.status === 201, `Register failed: ${register.response.status}`);
    assert((register.json as { ok?: boolean } | null)?.ok === true, "Register should return ok");

    console.log("Logging in unpaid user");
    await loginWithCredentials(unpaid, unpaidEmail);

    console.log("Checking unpaid gating");
    const pending = await unpaid.get("/pending");
    assert(pending.response.status === 200, `Pending page failed: ${pending.response.status}`);

    const fixtureBlocked = await unpaid.get("/fixture");
    assert(fixtureBlocked.response.status === 307, `Unpaid fixture should redirect: ${fixtureBlocked.response.status}`);
    assert(fixtureBlocked.response.headers.get("location")?.includes("/pending"), "Unpaid fixture should redirect to /pending");

    const unpaidPrediction = await unpaid.post("/api/predictions", {
      matchId: match.id,
      prediction: "HOME",
    });
    assert(unpaidPrediction.response.status === 403, `Unpaid prediction should be forbidden: ${unpaidPrediction.response.status}`);

    console.log("Logging in admin");
    await loginWithCredentials(admin, adminEmail);

    console.log("Activating payment from admin");
    const adminUsersPage = await admin.get("/admin/users");
    assert(adminUsersPage.response.status === 200, `Admin users page failed: ${adminUsersPage.response.status}`);

    const activatePayment = await admin.patch(`/api/admin/users/${(await prisma.user.findUniqueOrThrow({ where: { email: unpaidEmail }, select: { id: true } })).id}/payment`, {
      isPaid: true,
    });
    assert(activatePayment.response.status === 200, `Activate payment failed: ${activatePayment.response.status}`);
    assert((activatePayment.json as { isPaid?: boolean } | null)?.isPaid === true, "Payment toggle should set isPaid=true");

    console.log("Saving paid prediction");
    const fixturePaid = await unpaid.get("/fixture");
    assert(fixturePaid.response.status === 200, `Paid fixture should load: ${fixturePaid.response.status}`);

    const prediction = await unpaid.post("/api/predictions", {
      matchId: match.id,
      prediction: "HOME",
    });
    assert(prediction.response.status === 200, `Prediction save failed: ${prediction.response.status}`);

    const predictionList = await unpaid.get("/api/predictions");
    const predictions = Array.isArray(predictionList.json) ? predictionList.json : [];
    assert(predictions.some((entry) => (entry as { matchId?: string }).matchId === match.id), "Saved prediction missing from API");

    console.log("Saving challenger prediction");
    await loginWithCredentials(challenger, challengerEmail);
    const challengerPrediction = await challenger.post("/api/predictions", {
      matchId: match.id,
      prediction: "AWAY",
    });
    assert(challengerPrediction.response.status === 200, `Challenger prediction save failed: ${challengerPrediction.response.status}`);

    console.log("Checking kickoff-time lock while status is scheduled");
    await prisma.match.update({
      where: { id: kickoffLockMatch.id },
      data: { matchDate: new Date(Date.now() - 60 * 60 * 1000), status: "SCHEDULED" },
    });
    const kickoffLockedPrediction = await unpaid.post("/api/predictions", {
      matchId: kickoffLockMatch.id,
      prediction: "HOME",
    });
    assert(kickoffLockedPrediction.response.status === 403, `Kickoff-locked prediction should be forbidden: ${kickoffLockedPrediction.response.status}`);

    console.log("Locking predictions when match turns live");
    const live = await admin.patch(`/api/admin/matches/${match.id}`, {
      status: "LIVE",
    });
    assert(live.response.status === 200, `Admin live update failed: ${live.response.status}`);

    const livePredictionEdit = await unpaid.post("/api/predictions", {
      matchId: match.id,
      prediction: "AWAY",
    });
    assert(livePredictionEdit.response.status === 403, `Live match prediction should be blocked: ${livePredictionEdit.response.status}`);

    const livePicks = await unpaid.get(`/api/matches/${match.id}/picks`);
    assert(livePicks.response.status === 200, `Live match picks should load: ${livePicks.response.status}`);

    console.log("Finishing match from admin");
    const finished = await admin.patch(`/api/admin/matches/${match.id}`, {
      homeScore: 2,
      awayScore: 0,
      status: "FINISHED",
    });
    assert(finished.response.status === 200, `Admin match update failed: ${finished.response.status}`);

    const pointsAfterFinish = await prisma.predictionPoints.count({ where: { matchId: match.id } });
    assert(pointsAfterFinish === 2, `Expected two prediction point rows, got ${pointsAfterFinish}`);

    console.log("Saving same result again without duplicating points");
    const finishedAgain = await admin.patch(`/api/admin/matches/${match.id}`, {
      homeScore: 2,
      awayScore: 0,
      status: "FINISHED",
    });
    assert(finishedAgain.response.status === 200, `Repeated result save failed: ${finishedAgain.response.status}`);
    const pointsAfterRepeat = await prisma.predictionPoints.count({ where: { matchId: match.id } });
    assert(pointsAfterRepeat === 2, `Repeated save duplicated point rows: ${pointsAfterRepeat}`);

    await prisma.match.update({
      where: { id: match.id },
      data: { matchDate: new Date(Date.now() - 60 * 60 * 1000) },
    });

    console.log("Checking picks and ranking");
    const picks = await unpaid.get(`/api/matches/${match.id}/picks`);
    assert(picks.response.status === 200, `Locked picks should load: ${picks.response.status}`);
    const picksList = Array.isArray(picks.json) ? picks.json : [];
    assert(picksList.length === 2, `Expected two picks, got ${picksList.length}`);

    const refreshedUser = await prisma.user.findUniqueOrThrow({
      where: { email: unpaidEmail },
      select: { totalPoints: true },
    });
    assert(refreshedUser.totalPoints === 1, `Expected totalPoints=1, got ${refreshedUser.totalPoints}`);

    const refreshedChallenger = await prisma.user.findUniqueOrThrow({
      where: { email: challengerEmail },
      select: { totalPoints: true },
    });
    assert(refreshedChallenger.totalPoints === 0, `Expected challenger totalPoints=0, got ${refreshedChallenger.totalPoints}`);

    const ranking = await unpaid.get("/api/ranking");
    const rankingEntries = Array.isArray(ranking.json) ? ranking.json : [];
    assert(
      rankingEntries.some((entry) => (entry as { name?: string; totalPoints?: number }).name === unpaidName && (entry as { totalPoints?: number }).totalPoints === 1),
      "Ranking should include the paid user with 1 point"
    );

    const unpaidIndex = rankingEntries.findIndex((entry) => (entry as { name?: string }).name === unpaidName);
    const challengerIndex = rankingEntries.findIndex((entry) => (entry as { name?: string }).name === challengerName);
    assert(unpaidIndex >= 0 && challengerIndex >= 0 && unpaidIndex < challengerIndex, "Ranking should order 1-point user above 0-point user");

    console.log("Correcting result and recalculating points");
    const corrected = await admin.patch(`/api/admin/matches/${match.id}`, {
      homeScore: 0,
      awayScore: 1,
      status: "FINISHED",
    });
    assert(corrected.response.status === 200, `Corrected result save failed: ${corrected.response.status}`);
    const correctedUnpaid = await prisma.user.findUniqueOrThrow({
      where: { email: unpaidEmail },
      select: { totalPoints: true },
    });
    const correctedChallenger = await prisma.user.findUniqueOrThrow({
      where: { email: challengerEmail },
      select: { totalPoints: true },
    });
    assert(correctedUnpaid.totalPoints === 0, `Expected corrected unpaid totalPoints=0, got ${correctedUnpaid.totalPoints}`);
    assert(correctedChallenger.totalPoints === 1, `Expected corrected challenger totalPoints=1, got ${correctedChallenger.totalPoints}`);

    const correctedRanking = await unpaid.get("/api/ranking");
    const correctedEntries = Array.isArray(correctedRanking.json) ? correctedRanking.json : [];
    const correctedUnpaidIndex = correctedEntries.findIndex((entry) => (entry as { name?: string }).name === unpaidName);
    const correctedChallengerIndex = correctedEntries.findIndex((entry) => (entry as { name?: string }).name === challengerName);
    assert(
      correctedChallengerIndex >= 0 && correctedUnpaidIndex >= 0 && correctedChallengerIndex < correctedUnpaidIndex,
      "Ranking should reorder after corrected result"
    );

    console.log("Checking global lock blocks API predictions");
    server.kill("SIGTERM");
    await delay(1000);
    server = startServer({ PRODE_GLOBAL_LOCK_ISO: "2000-01-01T00:00:00Z" });
    await waitForServer();
    const lockedUser = new HttpClient();
    await loginWithCredentials(lockedUser, unpaidEmail);
    const globalLockPrediction = await lockedUser.post("/api/predictions", {
      matchId: globalLockMatch.id,
      prediction: "HOME",
    });
    assert(globalLockPrediction.response.status === 403, `Global lock prediction should be forbidden: ${globalLockPrediction.response.status}`);

    console.log("Checking sync routes");
    const liveSync = await admin.get("/api/sync");
    assert(liveSync.response.status === 200, `Admin sync failed: ${liveSync.response.status}`);
    assert(typeof (liveSync.json as { synced?: number } | null)?.synced === "number", "Admin sync should return stats");

    const cronSync = await fetch(`${baseUrl}/api/sync`, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
    });
    const cronJson = (await cronSync.json()) as { synced?: number };
    assert(cronSync.status === 200, `Cron sync failed: ${cronSync.status}`);
    assert(typeof cronJson.synced === "number", "Cron sync should return stats");

    const vercelCronUnauthorized = await fetch(`${baseUrl}/api/cron/sync`);
    assert(vercelCronUnauthorized.status === 401, `Vercel cron should require auth: ${vercelCronUnauthorized.status}`);

    const vercelCron = await fetch(`${baseUrl}/api/cron/sync`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
    });
    const vercelCronJson = (await vercelCron.json()) as { data?: { synced?: number } };
    assert(vercelCron.status === 200, `Vercel cron route failed: ${vercelCron.status}`);
    assert(typeof vercelCronJson.data?.synced === "number", "Vercel cron route should return stats");

    console.log("Checking push subscribe/unsubscribe and admin errors");
    const subscribe = await unpaid.post("/api/push/subscribe", {
      endpoint: fakeEndpoint,
      keys: {
        p256dh: "test-p256dh",
        auth: "test-auth",
      },
    });
    assert(subscribe.response.status === 200, `Push subscribe failed: ${subscribe.response.status}`);

    const pushTest = await admin.post("/api/admin/push/test");
    assert(pushTest.response.status === 500, `Push test should fail without VAPID: ${pushTest.response.status}`);
    assert((pushTest.json as { error?: string } | null)?.error === "VAPID keys no configuradas", "Push test should expose configured error");

    const broadcast = await admin.post("/api/admin/push/broadcast", {
      title: "QA",
      message: "Smoke test",
      url: "/",
    });
    assert(broadcast.response.status === 500, `Broadcast should fail without VAPID: ${broadcast.response.status}`);

    const unsubscribe = await unpaid.delete("/api/push/unsubscribe", {
      endpoint: fakeEndpoint,
    });
    assert(unsubscribe.response.status === 200, `Push unsubscribe failed: ${unsubscribe.response.status}`);

    const pendingAfterPayment = await unpaid.get("/pending");
    assert(pendingAfterPayment.response.status === 307, `Paid pending should redirect: ${pendingAfterPayment.response.status}`);
    assert(pendingAfterPayment.response.headers.get("location")?.includes("/"), "Paid pending should redirect home");

    console.log("QA smoke OK");
  } finally {
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await delay(1000);
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        OR: [
          { endpoint: fakeEndpoint },
          { user: { email: { in: [unpaidEmail, challengerEmail, adminEmail] } } },
        ],
      },
    });
    await prisma.predictionPoints.deleteMany({
      where: {
        OR: [
          { matchId: { in: [match.id, globalLockMatch.id, kickoffLockMatch.id] } },
          { user: { email: { in: [unpaidEmail, challengerEmail, adminEmail] } } },
        ],
      },
    });
    await prisma.prediction.deleteMany({
      where: {
        OR: [
          { matchId: { in: [match.id, globalLockMatch.id, kickoffLockMatch.id] } },
          { user: { email: { in: [unpaidEmail, challengerEmail, adminEmail] } } },
        ],
      },
    });
    await prisma.match.deleteMany({ where: { id: { in: [match.id, globalLockMatch.id, kickoffLockMatch.id] } } });
    await prisma.team.deleteMany({ where: { id: { in: [homeTeam.id, awayTeam.id] } } });
    await prisma.group.deleteMany({ where: { id: qaGroup.id } });
    await prisma.user.deleteMany({ where: { email: { in: [unpaidEmail, challengerEmail, adminEmail] } } });
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
