# Skill: prisma-postgres-auditor

## Responsibility
Schema integrity, query efficiency, migration safety for Prisma + Neon PostgreSQL.

---

## N+1 Detection

**Red flag:** any loop containing a DB call.

```typescript
// ❌ N+1 — one query per prediction
for (const pred of predictions) {
  const match = await prisma.match.findUnique({ where: { id: pred.matchId } });
}

// ✅ Single query with include
const predictions = await prisma.prediction.findMany({
  where: { userId },
  include: { match: true }
});
```

---

## Query Patterns

```typescript
// ✅ Parallel independent queries
const [matches, user] = await Promise.all([
  prisma.match.findMany({ where: { status: "LIVE" } }),
  prisma.user.findUnique({ where: { id: userId } })
]);

// ✅ updateMany > loop update
await prisma.user.updateMany({ data: { totalPoints: 0 } });

// ✅ upsert for create-or-update
await prisma.predictionPoints.upsert({ where: ..., create: ..., update: ... });

// ✅ Transaction for multi-table writes that must be atomic
await prisma.$transaction(async (tx) => { ... });
```

---

## Current Schema Indexes

```
User      → totalPoints (ranking query)
Match     → matchDate, status (fixture queries)
Prediction → userId, matchId (lookup + unique constraint)
```

**Before adding a new `findMany` with a `where` clause — check if the field is indexed.**

---

## Migration Safety Rules

1. Never drop a column with data — deprecate then clean up later
2. Adding NOT NULL column → always provide `default` value
3. Test migration on staging data shape before running on prod
4. Neon uses connection pooling (PgBouncer) — use `DIRECT_URL` for migrations

```bash
# Run migrations — always use DIRECT_URL, not pooled
npx prisma migrate deploy
```

---

## Common Mistakes to Prevent

| Mistake | Fix |
|---|---|
| `findFirst` when key is unique | Use `findUnique` (uses index) |
| Separate query for count | Use `_count` in the same query |
| Expose Prisma error to client | Catch and return generic message |
| Loop with `update` | Use `updateMany` or batch in transaction |
| Missing `include` on relation | Always specify, never rely on lazy loading |

---

## Schema Change Checklist

- [ ] New relation → add foreign key index
- [ ] New `findMany` filter field → add index if high cardinality
- [ ] New unique constraint → check existing data won't violate it
- [ ] Removing field → check all code references first
- [ ] New model → does it fit the product or is it overengineering?
