# Skill: security-audit

## Responsibility
Auth validation, permission gates, API protection, data exposure prevention.

---

## Auth Layers

```
Public (no auth)    → /login, /register
Authenticated       → all (main) routes
Paid + Authenticated → prediction submission
Admin               → /admin/*, /api/admin/*
Cron (secret)       → POST /api/sync
```

---

## Route Protection Template

```typescript
// Standard authenticated route
const session = await auth();
if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// Admin route
if (!session.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Paid-gated action
if (!session.user.isPaid) return NextResponse.json({ error: "Payment required" }, { status: 402 });

// Cron endpoint
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Data Exposure Rules

**Never return:**
- `password` field (even hashed)
- `CRON_SECRET` or any env var in responses
- Full user list with emails to non-admin
- Other users' unpublished predictions
- Internal Prisma error messages

**Always strip sensitive fields before response:**
```typescript
const { password, ...safeUser } = user;
```

---

## Prediction Security

- Validate match exists before accepting prediction
- Validate match status is SCHEDULED (not LIVE/FINISHED)
- Validate lock date not passed (`NEXT_PUBLIC_LOCK_DATE`)
- Validate user owns the prediction they're updating
- Use `upsert` not `create` to prevent duplicate predictions

---

## Admin Action Security

Admin actions that mutate data (recalculate, sync, payment approval) must:
1. Check `isAdmin` from server-side session (not client-sent)
2. Log the action (console.log is enough for now)
3. Return result summary, never raw DB objects

---

## Security Checklist (run before any auth-related PR)

- [ ] All new API routes have auth check as first operation
- [ ] No `process.env` values logged or returned in responses
- [ ] No client-side session trust for sensitive operations
- [ ] Prediction mutations check lock date server-side
- [ ] Payment approval only via admin session, not user self-serve
- [ ] No SQL injection vectors (Prisma parameterizes by default — OK)
- [ ] No XSS vectors in rendered user content
