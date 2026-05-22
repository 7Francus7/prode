import "dotenv/config";

type CheckLevel = "error" | "warn";

type Check = {
  level: CheckLevel;
  label: string;
  ok: boolean;
  detail: string;
};

const env = process.env;

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXTAUTH_SECRET",
  "CRON_SECRET",
  "PAYMENT_ALIAS",
  "PAYMENT_OWNER",
  "INSCRIPTION_AMOUNT",
] as const;

const checks: Check[] = required.map((key) => ({
  level: "error",
  label: key,
  ok: Boolean(env[key] && env[key]?.trim()),
  detail: "required",
}));

checks.push({
  level: "warn",
  label: "NEXTAUTH_URL",
  ok: Boolean(env.NEXTAUTH_URL && /^https?:\/\//.test(env.NEXTAUTH_URL)),
  detail: "should be set to the final public app URL",
});

checks.push({
  level: "warn",
  label: "NEXTAUTH_URL localhost",
  ok: !env.NEXTAUTH_URL?.includes("localhost"),
  detail: "production deploy should not keep localhost in NEXTAUTH_URL",
});

const hasAllVapid =
  Boolean(env.VAPID_PUBLIC_KEY?.trim()) &&
  Boolean(env.VAPID_PRIVATE_KEY?.trim()) &&
  Boolean(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim());

checks.push({
  level: "warn",
  label: "Web Push",
  ok: hasAllVapid,
  detail: "optional, but required if you want browser push notifications",
});

checks.push({
  level: "warn",
  label: "FOOTBALL_API_KEY",
  ok: Boolean(env.FOOTBALL_API_KEY?.trim()),
  detail: "optional, but required for live sync against API-Football",
});

checks.push({
  level: "warn",
  label: "Cron mode",
  ok: true,
  detail:
    "Vercel Hobby only supports daily native cron. Use /api/cron/sync for Vercel cron or POST /api/sync from cron-job.org for 15 min sync.",
});

let hasErrors = false;

console.log("Deploy readiness:");
for (const check of checks) {
  const prefix = check.ok ? "[ok]" : check.level === "error" ? "[error]" : "[warn]";
  console.log(`${prefix} ${check.label} - ${check.detail}`);
  if (!check.ok && check.level === "error") {
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
}
