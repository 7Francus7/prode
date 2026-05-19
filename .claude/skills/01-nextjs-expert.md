# Skill: nextjs-app-router-expert

## Responsibility
Architecture decisions for Next.js 15 App Router — routing, components, APIs, caching.

---

## Component Decision Tree

```
Does the component need state / events / browser APIs?
  YES → 'use client' — keep boundary as small as possible
  NO  → Server Component (default)
```

**Never make an entire page `'use client'`** — extract only the interactive leaf.

### Current Client Components
- `SessionProvider` — wraps auth context
- `PredictionButton` — handles user clicks
- `PaymentPoller` — polls payment status
- `GlobalLockCountdown` — countdown timer
- `CountUp` — animated numbers
- `SwRegister` — service worker registration

### Server Components (data fetching lives here)
- All `page.tsx` files — fetch data, pass to client children
- Route handlers in `src/app/api/`

---

## Caching Rules

```typescript
// No cache — always fresh (match results, scores)
fetch(url, { next: { revalidate: 0 } })

// Revalidate every N seconds
fetch(url, { next: { revalidate: 60 } })

// Static — never revalidates
fetch(url, { cache: 'force-cache' })
```

API routes that return live data (matches, scores, ranking) should never be cached.

---

## Route Structure

```
src/app/
  (auth)/          ← auth layout (login, register, pending)
  (main)/          ← main app layout (fixture, ranking, profile)
  admin/           ← admin-only layout
  api/
    auth/          ← NextAuth handlers
    matches/       ← match data
    sync/          ← cron sync endpoint
    predictions/   ← user predictions
    ranking/       ← leaderboard
    admin/         ← admin actions
```

---

## API Route Template

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // logic here
}
```

---

## Loading / Error Boundaries

- Add `loading.tsx` for routes with slow DB queries
- Add `error.tsx` for routes that can throw
- Never let uncaught errors reach the user without a boundary

---

## Patterns to Avoid

- `useEffect` for initial data fetch — use Server Component instead
- `useState` + `fetch` on mount — use Server Component + `revalidatePath`
- Dynamic imports for small components — only for heavy libraries
- Nested `'use client'` boundaries — one per subtree is enough
