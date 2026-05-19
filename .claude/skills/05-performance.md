# Skill: performance-optimizer

## Responsibility
Eliminate unnecessary renders, optimize fetches, fix hydration, improve load times.

---

## Data Fetching Priority

```
Server Component fetch (best)
  → no client bundle cost
  → no loading flash
  → cached by Next.js

Route Handler + SWR/React Query (when real-time needed)
  → prediction status, live scores during match

useEffect + fetch (avoid)
  → causes layout shift
  → adds bundle weight
  → triggers hydration mismatch risk
```

---

## Parallel Fetching Pattern

```typescript
// ✅ Parallel — both queries run simultaneously
const [matches, userPredictions] = await Promise.all([
  prisma.match.findMany({ where: { groupId } }),
  prisma.prediction.findMany({ where: { userId, matchId: { in: matchIds } } })
]);

// ❌ Sequential — second waits for first unnecessarily
const matches = await prisma.match.findMany(...);
const predictions = await prisma.prediction.findMany(...);
```

---

## Hydration Issues

Common causes in this app:
- Date formatting with `new Date().toLocaleDateString()` — client/server mismatch
- Reading `localStorage` or `window` in Server Component
- `Math.random()` in render

**Fix:** Use `suppressHydrationWarning` on date elements, or defer date formatting to client-only component.

---

## Client Bundle Size

Check before adding dependencies:
```bash
npx next build  # check "First Load JS" column
```

Red flags:
- First Load JS > 150kb for a route
- Importing a full library for one function (lodash, moment)
- Heavy chart libraries (recharts, d3) — only import if showing charts

---

## Loading States

| Situation | Solution |
|---|---|
| Page with slow DB query | `loading.tsx` in route segment |
| Optimistic prediction button | Immediate visual feedback, reconcile after |
| Countdown timer | Client component, no SSR needed |
| Ranking on load | Skeleton → data (not blank flash) |

---

## Rendering Checklist

- [ ] No `useEffect` for initial data that could be server-fetched
- [ ] No sequential `await` when calls are independent
- [ ] Client components don't import server-only modules
- [ ] No unnecessary re-renders (check missing `useMemo`/`useCallback` on heavy lists)
- [ ] `next/image` used for all images (auto-optimization)
- [ ] Fonts loaded via `next/font` (eliminates FOUT)
