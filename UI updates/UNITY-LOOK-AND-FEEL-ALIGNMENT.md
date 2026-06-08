# Unity Oracle Prototype → Real Dashboard: Look-and-Feel Alignment

> Goal: bring the prototype in `UI updates/` (app.css + 8 HTML pages) visually in line
> with the live product at **https://dashboard.unityacademy.io/**.
> Reference screenshot: `reference-real-dashboard.png` (captured 2026-06-07).
> Design tokens below were read directly from the live site's CSS.

---

## 1. The core mismatch (read this first)

| | Real dashboard | Current prototype | Fix |
|---|---|---|---|
| **Surface hue** | Warm near-black (`#050505`→`#141211`, slight warm/brown) | Cool **purple-tinted** (oklch hue 280) | Re-tint surfaces warm/neutral |
| **Accent** | Exact orange **`#FE6700`** (`rgb 254,103,0`) | `oklch(0.62 0.22 42)` — close but off | Use the exact hex |
| **Positive** | True green **`#22C55E`** | `oklch(0.78 0.16 85)` — amber/lime | Use true green |
| **Negative** | Red **`#EF4444`** | `oklch(0.50 0.22 25)` — red-orange | Use true red |
| **Display font** | **Outfit** (everything) | **Cabinet Grotesk** | Drop Cabinet Grotesk |
| **Numbers** | **JetBrains Mono** | mixed | Mono for all prices/%/stats |
| **Shell** | Sidebar (desktop) + bottom nav (mobile) | Top nav + launcher grid | Adopt sidebar/bottom-nav |
| **Cards** | Flat, 12px radius, hairline orange-tint border | Glassy purple gradient + heavy glow | Flatten, warm, subtle |

The single biggest visual tell is the **purple tint + glass gradients**. The real product is
**warm, flat, and matte** with a faint orange-tinted hairline on cards — not glassy, not glowing.

---

## 2. Drop-in token replacement

Replace the `:root` block at the top of `css/app.css` with these. Tokens mirror the live site
(`--surface-0..3`, `--brand-*`) so the vocabulary matches the real codebase too.

```css
:root {
  /* Surfaces — warm near-black scale (from live site) */
  --surface-0: #050505;   /* page background */
  --surface-1: #0a0908;   /* raised panels */
  --surface-2: #0c0a09;   /* cards (use at 0.8 alpha: rgba(12,10,9,.8)) */
  --surface-3: #141211;   /* hover / elevated */
  --bg: var(--surface-0);
  --surface: var(--surface-2);
  --surface-hover: var(--surface-3);

  /* Brand + semantics — exact live values */
  --brand-orange: #FE6700;          /* rgb(254,103,0) */
  --brand-green:  #22C55E;          /* rgb(34,197,94) up */
  --brand-red:    #EF4444;          /* rgb(239,68,68) down */
  --accent: var(--brand-orange);
  --accent-hover: #ff7d24;
  --positive: var(--brand-green);
  --negative: var(--brand-red);

  /* Accent washes — how the real site does highlights (NOT glows) */
  --accent-wash:   rgba(254,103,0,0.10);   /* highlighted tile bg */
  --accent-hair:   rgba(254,103,0,0.12);   /* card border */
  --card-bg:       rgba(12,10,9,0.80);

  /* Text — white with opacity ramps (matches live fg palette) */
  --fg:       #ffffff;
  --fg-dim:   rgba(255,255,255,0.50);
  --fg-dimmer:rgba(255,255,255,0.40);
  --fg-faint: rgba(255,255,255,0.30);
  --muted:    #9CA3AF;                 /* rgb(156,163,175) labels */
  --border:   rgba(255,255,255,0.06);
  --border-glass: rgba(255,255,255,0.05);

  /* Secondary accents seen on the live site (sparingly) */
  --violet: #8B5CF6;   /* trending/indicator chips */
  --amber:  #F59E0B;   /* RSI "Neutral", warnings */

  /* Typography — Outfit everywhere, JetBrains Mono for numbers */
  --font-display: 'Outfit', 'Segoe UI', sans-serif;
  --font-body:    'Outfit', 'Segoe UI', sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Radius — match live (cards 12, buttons 8, pills full) */
  --radius-sm: 8px;
  --radius-md: 12px;     /* was 16 — real cards are 12 */
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

**Also:** add JetBrains Mono to the font import in every `<head>` (currently only Outfit):
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
```
Then remove the `Cabinet Grotesk` reference from `--font-display`.

---

## 3. Component-level changes

### Cards (`.glass`, `.square-card`, tiles)
- Background: `var(--card-bg)` (`rgba(12,10,9,.8)`) — **remove the purple gradients**
  (`linear-gradient(145deg, rgba(30,30,35…))`).
- Border: `1px solid var(--accent-hair)`.
- Radius: `var(--radius-md)` (12px). Padding `16px`.
- `box-shadow: none`. **Delete the `--accent-glow` / `*-glow` halos** — the real site has none;
  it relies on the hairline border + subtle `--accent-wash` fill for emphasis.

### Buttons
- Primary (CTA, e.g. "Activate Kickback"): solid `var(--brand-orange)`, black text, radius 8px,
  weight 600.
- Secondary ("+ Customize"): transparent bg, `1px solid var(--border)`, `--fg-dim` text → white on hover.

### Numbers & stats
- Wrap every price, %, and metric in `font-family: var(--font-mono)`.
- Up values `color: var(--positive)`, down `var(--negative)`, each prefixed with ↗ / ↘.
- Small grey "24h" tag (`--muted`, `--text-xs`) after the change, as on the live stat cards.

### Stat-card row (Markets)
Mirror the live layout: a row of compact cards each with
`UPPERCASE LABEL` (letter-spaced, `--muted`, xs) + a small icon top-right, a large mono value,
then the change line. The RSI card adds a horizontal red→green gradient bar and a `Neutral`
pill in `--amber`.

### Labels
- Section labels ("Markets", "Your Dashboard", "NAVIGATION") are uppercase, letter-spaced,
  `--muted`, `--text-xs`.

---

## 4. App shell / navigation (the biggest structural change)

The prototype is a top-nav "launcher". The real app is a **persistent left sidebar on desktop,
collapsing to a fixed bottom nav on mobile** (`aside.sidebar-desktop` + `nav.lg:hidden.bottom-0`).
To feel like Unity, adopt this shell across all pages:

**Desktop sidebar (left, fixed):**
1. Logo lockup top — UNITY ACADEMY triangular mark + wordmark.
2. `NAVIGATION` label, then items with icon + label:
   Overview · Markets · Live Intel · Signals & Alerts · Trades · Indicators · Education · Trading Journal · News.
   - Active item: `--accent` text, `--accent-wash` background, left edge orange indicator bar.
   - Inactive: `--fg-dim`, white on hover.
3. A promo card near the bottom (the live site's "BLOFIN × UNITY ACADEMY — Save 20%" block).
4. Connection status row (green dot + "Connected" + `Premium` pill).
5. User chip footer (avatar + handle + "Member" + logout icon).

**Mobile bottom nav:** fixed bar, 4–5 primary icons, `lg:hidden`, respects
`env(safe-area-inset-bottom)` (the live site defines `--safe-bottom` for this — keep it).

**Top bar (content area):** page title + subtitle ("Overview / Welcome back, …"), a
"Search coins… ⌘K" input, and a green **Live** indicator + refresh button on the right.

---

## 5. Texture & motion
- Page background uses a **subtle grid** (`bg-grid` on `surface-0`) — a faint 1px line grid,
  very low contrast. Add it instead of the prototype's gradient wash.
- Keep motion minimal: the real UI is calm. Reuse the prototype's `--ease-out` for hovers,
  but drop spring/bounce and the glow pulses.

---

## 6. Prioritized checklist (do in this order)

- [x] **P0 — Tokens:** warm `--surface-0..3`, exact `#FE6700`/`#22C55E`/`#EF4444`, 12px radius — applied to `css/app.css` (2026-06-07).
- [x] **P0 — Fonts:** JetBrains Mono added to all 8 HTML imports; Cabinet Grotesk removed. _Still TODO: mono-ize number spans page-by-page._
- [x] **P1 — Cards (partial):** `.glass`/`.glass-sm` flattened — purple gradients + glows removed, now `--card-bg` + `--accent-hair` + 12px. _Per-page tiles may need spot fixes._
- [ ] **P1 — Shell:** build the sidebar (desktop) + bottom nav (mobile) and reuse on every page.
- [ ] **P2 — Stat cards & widgets:** rebuild Markets row + Top Gainers/Losers/Trending widget cards to match.
- [ ] **P2 — Top bar:** title/subtitle + search + Live indicator.
- [ ] **P3 — Texture:** grid background, calm hovers, promo + connection + profile blocks.

> P0 alone gets ~70% of the "this looks like Unity" effect because the purple→warm + exact
> orange/green/red swap is what the eye reads first.

---

## 7. Verified design tokens (source of truth, from the live site)

```
--brand-orange  rgb(254,103,0)   #FE6700
--brand-green   rgb(34,197,94)   #22C55E
--brand-red     rgb(239,68,68)   #EF4444
--surface-0     #050505   --surface-1 #0a0908
--surface-2     #0c0a09   --surface-3 #141211
card bg         rgba(12,10,9,0.8)   card border 1px rgba(254,103,0,0.12)   radius 12px
button radius   8px
body            bg #050505 · color #fff · font "Outfit, sans-serif" · 16px
fonts           Outfit (300/500/600/700) + "JetBrains Mono"
secondary       violet rgb(139,92,246) · amber rgb(245,158,11)
text ramps      #fff, rgba(#fff .5/.45/.4/.3), muted rgb(156,163,175)
```
