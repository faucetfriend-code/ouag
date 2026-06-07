# Unity Oracle Aggregator — Brand Spec

Extracted from `mq47ckce-branding_and_style_guide.md`. Overrides the Neutral Modern active design system (the brand guide is more specific and domain-appropriate).

## Color tokens (OKLch)

```css
:root {
  --bg:          oklch(0.02 0.005 280);   /* #060608 Deep Obsidian */
  --surface:     oklch(0.10 0.015 280);   /* dark charcoal for glass panels */
  --fg:          oklch(0.92 0.005 280);   /* near white for text */
  --muted:       oklch(0.55 0.02 280);    /* mid-grey for secondary text */
  --border:      oklch(0.25 0.01 280 / 0.5); /* glass border (rgba white 8%) */
  --accent:      oklch(0.62 0.22 42);     /* #ff6b35 Electric Orange */
  --positive:    oklch(0.78 0.16 85);     /* #ffc107 Cyber Gold */
  --negative:    oklch(0.50 0.22 25);     /* #dc3545 Neon Cyber Red */
}
```

## Font stacks

- **Display:** 'Cabinet Grotesk', 'Outfit', 'Segoe UI', sans-serif
- **Body:** 'Outfit', 'Inter', 'Segoe UI', sans-serif
- **Mono:** 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace

## Layout posture

1. **Glassmorphic cards:** `backdrop-filter: blur(16px)`, 1px `rgba(255,255,255,0.08)` border, 16px radius
2. **Pill buttons:** 24px / 9999px radius, orange-to-red (`#ff6b35 → #dc3545`) gradient primary, gold-to-orange highlight variant
3. **Dark gradient bg:** `#060608 → #121216` subtle linear gradient as page backdrop
4. **High-contrast tri-color system:** one accent (orange for CTAs/links/metrics), one positive signal (gold), one negative signal (red)
5. **Glow / pulse effects:** pulsating ring shadows on active data triggers (`.pulse-orange`, `.pulse-green`), button shine hover effect
6. **Touch targets ≥ 44px** on mobile, edge-swipe navigation for mobile tray
7. **Responsive grid:** single-column <768px, 2-column 768–1024px, 3-column >1024px
