# Skill: prode-product-guardian

## THIS IS THE MOST IMPORTANT SKILL — Read before any feature decision.

---

## What This Product Is

A casual friend-group football prediction pool for FIFA World Cup 2026.
Simple. Fun. Mobile. Premium feel without complexity.

---

## Hard Constraints (never negotiate these)

| Rule | Why |
|---|---|
| Group stage only | Tournament structure is the scope — no more |
| HOME / DRAW / AWAY only | 3 buttons. Everyone understands. Don't add options |
| 1 point correct, 0 wrong | No streaks, no multipliers, no bonus rounds |
| No exact score prediction | Adds complexity, kills casual participation |
| No bracket prediction | Would require rebuilding entire system |
| No real money | This is between friends, not a betting site |

---

## Feature Request Evaluation Framework

When a feature is requested, evaluate it through these filters:

### Filter 1: Product Fit
> "Would this exist in a 5-minute friendly bet between coworkers?"
- YES → consider it
- NO → reject or defer heavily

### Filter 2: Complexity Cost
> "Does this require a new DB model, a new page, or a new API route?"
- 0 additions → green light
- 1 addition → justify clearly
- 2+ additions → strong red flag, simplify

### Filter 3: Mobile UX Impact
> "Does this make the phone experience worse or require more taps?"
- Better / same → OK
- More taps → redesign first
- Requires desktop → reject

### Filter 4: Maintenance Burden
> "If this breaks in the middle of a match, how bad is it?"
- Core feature (predictions, sync, points) → fix immediately, test thoroughly
- Nice-to-have (stats, animations) → non-critical, can wait

---

## Features That Are OUT OF SCOPE (don't implement unless explicitly required)

- Exact score prediction
- Goal scorer prediction
- Match statistics / live data display
- Head-to-head user comparison
- Achievement badges / gamification
- Social features (comments, reactions)
- Notifications / push alerts
- Stripe / real payment integration
- Multiple pools / leagues
- Bracket stage predictions
- Admin match creation UI (use seed script)

---

## Features That Are GOOD TO HAVE (implement carefully)

- Better mobile navigation
- Faster load times
- Clearer empty states
- Better error messages
- Group standings display (read-only)
- Ranking with position delta
- Profile name/avatar customization

---

## Design Philosophy

```
Less is more.
If in doubt, don't add it.
One screen should do one thing.
The best UI is the one users don't have to think about.
```

---

## Auto-Evaluation Response Template

When evaluating any proposed change, respond with:

```
PRODUCT GUARDIAN REVIEW
━━━━━━━━━━━━━━━━━━━━━━
Feature: [name]
Scope fit:     ✓ / ✗  [reason]
Complexity:    LOW / MEDIUM / HIGH
Mobile impact: BETTER / SAME / WORSE
Verdict:       APPROVE / SIMPLIFY / REJECT
Notes: [specific concerns or suggestions]
```
