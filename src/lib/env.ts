import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("production"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),

  // Cron
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),

  // Football API — optional, falls back to MockFootballProvider
  FOOTBALL_API_KEY: z.string().optional(),

  // Web Push — optional, push notifications disabled if missing
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_EMAIL: z.string().default("admin@example.com"),

  // Payment display — optional so pending page can show "???" when unset
  INSCRIPTION_AMOUNT: z.coerce.number().optional(),
  PAYMENT_ALIAS: z.string().default("alias.banco.ejemplo"),
  PAYMENT_CBU: z.string().default("0000000000000000000000"),
  PAYMENT_OWNER: z.string().default("Nombre Titular"),
  PAYMENT_BANK: z.string().default("Banco"),

  // Public vars — also readable server-side
  NEXT_PUBLIC_LOCK_DATE: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
    .join("\n");
  throw new Error(`\n\n❌ Invalid environment variables:\n${lines}\n`);
}

export const env = parsed.data;
