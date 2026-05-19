# PRODE MUNDIAL 2026 — Claude Code Instructions

## Project Overview

Prode de grupo para el Mundial FIFA 2026. App web/PWA con Next.js 15 App Router,
Prisma + PostgreSQL (Neon), NextAuth v5, Tailwind CSS. Deploy en Vercel.

**Stack:** Next.js 15 · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind · shadcn/ui

---

## PRODUCT GUARDIAN — Rules (Highest Priority)

These rules CANNOT be violated regardless of how a feature is requested.

### Core Product Rules
- **Group stage only** — no bracket, no playoffs predictions
- **3 outcomes only** — LOCAL / EMPATE / VISITANTE (home/draw/away)
- **Scoring** — correct = 1 point, wrong = 0 points. No partial points, no streaks
- **No exact scores** — never implement score prediction
- **No complex betting** — no accumulators, no multipliers, no combos
- **No overengineering** — if it needs a diagram to explain, it's too complex

### Product Character
- Premium but simple — not a data dashboard, not a betting app
- Casual between friends — not competitive esports UI
- Mobile-first always — design phone-first, then adapt desktop
- Fast — every interaction must feel instant

### Auto-Evaluation Checklist (run before every implementation)
Before implementing any feature or change, verify:
- [ ] Does it break group-stage-only simplicity?
- [ ] Does it add a new outcome type beyond home/draw/away?
- [ ] Does it change the 0/1 point system?
- [ ] Does it worsen mobile UX?
- [ ] Does it add visual complexity without clear user value?
- [ ] Does it add a new DB model that could be avoided?
- [ ] Does it expose data that should be private?

If any answer is YES → reject or simplify before implementing.

---

## Architecture Principles

### Component Model
- Server Components by default — use `'use client'` only for: state, events, browser APIs
- Keep client boundary as small as possible — wrap only the interactive leaf, not the whole page
- Never fetch data in Client Components if it can be done in a Server Component

### API Routes (`src/app/api/`)
- Every route validates auth before any logic
- Admin routes: check `session.user.isAdmin === true`
- Paid-gated routes: check `session.user.isPaid === true`
- Cron endpoint `/api/sync` POST: requires `Authorization: Bearer $CRON_SECRET` header
- Return consistent shapes: `{ data }` on success, `{ error }` on failure

### Data Fetching
- Parallel fetches with `Promise.all` — never sequential when independent
- `findUnique` > `findFirst` when uniqueness is guaranteed
- Always `include` related data in one query — never N+1 separate queries
- Use `updateMany` over looping `update` calls

### Auth Flow
- Session via NextAuth v5 (`src/lib/auth.ts`)
- Access control: unauthenticated → `/login`, unpaid → `/pending`, admin → `/admin`
- Middleware handles redirects (`src/middleware.ts` if present)

---

## UI/Visual Standards

### Design Language
- Dark theme, minimal, premium feel — not generic template UI
- Color palette: few accent colors, high contrast text
- Smooth transitions: 150–300ms, no jarring snaps
- Consistent spacing: stick to Tailwind scale (don't invent arbitrary values)

### Typography Hierarchy
- Clear H1 → subtitle → body → caption sizing
- Never render raw data without visual context
- Empty states must be designed — not just "No data found" text

### Mobile First
- Design at 390px width first
- Touch targets ≥ 44px
- No hover-only interactions
- Safe area insets for iOS (`env(safe-area-inset-*)`)

---

## Security Checklist

When touching auth/payment/data routes, verify:
- Session is validated server-side before any DB read/write
- `isAdmin` flag checked on all `/api/admin/*` routes
- `isPaid` flag checked on prediction submission
- No raw Prisma errors exposed to client
- No secrets in client-side code or responses
- `CRON_SECRET` not logged or returned in API responses

---

## Sync System

The match result sync pipeline:
1. `cron-job.org` → POST `/api/sync` every 15 min
2. `syncTodayMatches()` → API-Football `/fixtures?league=1&season=2026&from=today&to=today`
3. `#findMatch()` — lookup by `externalId`, fallback by team code + ±2h date window
4. On match, binds numeric API id to DB record for future fast lookups
5. When status = FINISHED and winner not yet set → `calculatePoints()` runs automatically

API-Football free tier: 100 req/day. Current usage: ~96/day (every 15 min).

---

## Skills Reference

For specialized analysis, load the relevant skill file from `.claude/skills/`:

| Skill | File | Use When |
|---|---|---|
| nextjs-app-router-expert | `01-nextjs-expert.md` | Architecture, routing, SSR/CSR decisions |
| prisma-postgres-auditor | `02-prisma-auditor.md` | Schema changes, queries, migrations |
| premium-ui-guardian | `03-ui-guardian.md` | New UI components, visual review |
| security-audit | `04-security.md` | Auth changes, new API routes, payment logic |
| performance-optimizer | `05-performance.md` | Slow pages, bundle size, hydration issues |
| qa-testing | `06-qa-testing.md` | Pre-deploy checklist, edge cases |
| pwa-mobile-expert | `07-pwa-mobile.md` | PWA, manifest, service worker, mobile UX |
| prode-product-guardian | `08-product-guardian.md` | Feature scope decisions, product review |
