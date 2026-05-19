# Skill: pwa-mobile-expert

## Responsibility
PWA installability, service worker, native-app feel, iOS/Android UX optimization.

---

## PWA Requirements Checklist

- [ ] `manifest.ts` has correct `name`, `short_name`, `theme_color`, `background_color`
- [ ] `display: "standalone"` — hides browser chrome when installed
- [ ] Icons: 192×192 and 512×512 PNG (maskable preferred)
- [ ] Service worker registered (`SwRegister` component exists)
- [ ] HTTPS in production (Vercel handles this)
- [ ] `apple-touch-icon` meta tag in `layout.tsx`

---

## iOS-Specific Requirements

```html
<!-- In layout.tsx <head> -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

```css
/* Safe areas for iPhone notch/Dynamic Island */
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

---

## Touch UX Rules

```
Tap target size:   min 44×44px (Apple HIG / Google Material)
Tap feedback:      active:scale-95 or active:opacity-80 (immediate visual response)
Swipe gestures:    only if there's a visible affordance (don't rely on hidden swipes)
Scroll momentum:   use -webkit-overflow-scrolling: touch on scroll containers
Double-tap zoom:   prevent with touch-action: manipulation on interactive elements
```

---

## Service Worker Strategy

Current: basic cache for static assets via Next.js.

If offline support is needed:
- Cache: static assets, match schedule, team data
- Network-first: scores, predictions, ranking (must be fresh)
- Never cache: auth routes, API mutations

---

## Native App Feel Checklist

- [ ] No visible URL bar when installed (requires `display: standalone`)
- [ ] Splash screen shows (requires correct manifest icons + background_color)
- [ ] No blue tap highlight (`-webkit-tap-highlight-color: transparent`)
- [ ] Smooth scroll (`scroll-behavior: smooth` on html element)
- [ ] Keyboard doesn't break layout (test with soft keyboard open)
- [ ] Back button works naturally (router.back() where appropriate)

---

## Performance on Mobile

- First Contentful Paint < 2s on 4G
- Avoid large images without `next/image` optimization
- Avoid animations that trigger layout reflow (use `transform` and `opacity` only)
- Lazy load content below the fold
- Reduce JavaScript on initial load — check `next build` output per route
