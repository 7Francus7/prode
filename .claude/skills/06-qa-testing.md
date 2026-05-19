# Skill: qa-testing

## Responsibility
Pre-deploy QA checklist, critical flow validation, regression detection.

---

## Pre-Deploy Checklist (run before every deploy)

```bash
npx tsc --noEmit   # type errors
npx next build     # build errors + bundle analysis
```

Both must pass clean before pushing to main.

---

## Critical Flows to Validate

### Auth Flow
- [ ] Register → pending page (if payment required)
- [ ] Login with correct credentials → main app
- [ ] Login with wrong credentials → error message shown
- [ ] Logout → redirected to login
- [ ] Accessing protected route while logged out → redirected to login
- [ ] Admin route accessed by non-admin → 403

### Prediction Flow
- [ ] Logged-in paid user can submit prediction on SCHEDULED match
- [ ] Prediction shows selected state immediately after click
- [ ] Changing prediction updates correctly (upsert behavior)
- [ ] Prediction blocked on LIVE match
- [ ] Prediction blocked on FINISHED match
- [ ] Prediction blocked after global lock date
- [ ] Unpaid user cannot submit prediction

### Sync + Points Flow
- [ ] Admin can trigger manual sync
- [ ] After sync, FINISHED match shows score
- [ ] Points calculated only on first FINISHED status (not re-run)
- [ ] Recalculate resets and recomputes correctly
- [ ] Ranking order matches totalPoints descending

### Admin Flow
- [ ] User list shows all users
- [ ] Admin can approve payment (isPaid toggle)
- [ ] Admin sync page shows last sync result
- [ ] Recalculate doesn't break existing data

---

## Edge Cases to Verify

| Scenario | Expected |
|---|---|
| User with 0 predictions | Shows 0 points in ranking |
| Match with no predictions | calculatePoints runs, no errors |
| Sync with 0 matches today | Returns `{ synced: 0 }`, no error |
| Double prediction submit | Upsert — no duplicate, no error |
| Match without externalId | Fallback by team code + date |
| Lock date in past | All predictions blocked |

---

## Regression Checklist (after any schema/logic change)

- [ ] Ranking still shows correct totalPoints after recalculate
- [ ] Predictions still visible on fixture page
- [ ] Match dates display correctly in user's timezone
- [ ] Mobile layout not broken on 390px viewport
- [ ] Admin panel still loads without 500 errors

---

## Mobile QA

Test at 390px (iPhone SE) viewport minimum:
- [ ] Match cards don't overflow
- [ ] Prediction buttons are thumb-reachable
- [ ] Text is readable without zooming
- [ ] Group tabs scroll horizontally without layout break
- [ ] Rankings table scrolls or adapts to narrow screen
