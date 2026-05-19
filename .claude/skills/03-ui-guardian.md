# Skill: premium-ui-guardian

## Responsibility
Maintain the visual identity: premium, minimal, dark, mobile-first. No generic template UI.

---

## Visual Identity

**The app should feel like:** a sleek sports product, not a CRUD admin panel.

| Good | Bad |
|---|---|
| Dark bg with subtle gradients | Flat white Bootstrap-style cards |
| High contrast text hierarchy | Gray on gray, unreadable |
| Smooth micro-interactions | Jumpy state changes |
| Deliberate empty states | "No data found" raw text |
| Consistent icon set | Mixed icon libraries |
| One or two accent colors | Rainbow of colors |

---

## Color Palette (enforce consistency)

- Background: dark (`zinc-900` / `zinc-950` range)
- Surface: slightly lighter dark (`zinc-800` / `zinc-900`)
- Accent: single primary color — check existing usage before adding new
- Text primary: `white` or `zinc-100`
- Text secondary: `zinc-400`
- Success/correct: `emerald-500`
- Error/wrong: `red-500`
- Live indicator: `green-400` with pulse animation

---

## Spacing Rules

```
Component padding: p-4 (mobile) → p-6 (desktop)
Card gap: gap-3 (mobile) → gap-4 (desktop)
Section spacing: py-6 (mobile) → py-10 (desktop)
Never use arbitrary values like p-[13px] — use Tailwind scale
```

---

## Typography Hierarchy

```
Page title:    text-2xl font-bold (mobile) → text-3xl (desktop)
Section head:  text-lg font-semibold
Card title:    text-base font-medium
Body:          text-sm text-zinc-300
Caption/meta:  text-xs text-zinc-500
```

---

## Mobile-First Checklist

- [ ] All layouts start at 390px width
- [ ] Touch targets ≥ 44px height
- [ ] No hover-only tooltips or actions
- [ ] Bottom nav or thumb-reach for primary actions
- [ ] Cards don't overflow viewport horizontally
- [ ] Text doesn't require zooming to read

---

## Match Card Standards

The match card is the core UI unit. It must always show:
- Team flags + codes (bold, readable)
- Match date + time in user's local timezone
- Stadium + city (smaller, secondary)
- Status badge (SCHEDULED / LIVE pulsing / FINISHED)
- Score if finished
- Prediction buttons when applicable (clear active state)

---

## Anti-Patterns to Reject

- Tables for match lists (use cards)
- Dropdown menus where tabs work better
- Modals for simple confirmations (use inline)
- Skeleton loaders for <200ms fetches (just show content)
- Tooltips as primary information delivery
- Icons without accessible labels on mobile
- Font sizes below 12px
