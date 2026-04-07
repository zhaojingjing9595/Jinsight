# JINSIGHT — Design System & UI/UX Style Guide

> This file is the single source of truth for all visual and UX decisions in Jinsight.
> Claude Code must read this before generating any UI component, screen, or style.
> Every decision here has been deliberately chosen — do not deviate without explicit instruction.

---

## 1. Design Philosophy

Jinsight's visual identity is **Neobrutalism** — raw, confident, and intentionally bold. It rejects the frosted-glass, muted-purple sameness of every other fintech app (Mint, YNAB, Copilot, Monarch) and instead feels alive, fun, and honest about money.

**Three words that define the aesthetic:**
- **Bold** — thick borders, hard shadows, unapologetic color
- **Playful** — illustrated icons, starburst accents, warm parchment base
- **Honest** — no gradients hiding complexity, no decoration over information

**Inspirations to keep in mind:**
- Image 1 energy: white/cream base, mint + purple two-tone, thick outlined illustrations that break container bounds, zine-editorial feel
- Image 4 energy: cream base with dramatic ink-black contrast zones, condensed display type for hero numbers, starburst decorations, dense but organized dashboard
- Image 5 energy: restraint as a power move — one bold color fill, one centered illustration, two lines of type on onboarding/splash screens

---

## 2. Color System

### 2.1 Core Palette (Active in App)

These are the primary variables. Use them by name — never hardcode hex values in components.

| Token Name             | Hex       | Role                                              |
|------------------------|-----------|---------------------------------------------------|
| `--color-base`         | `#fcfaeb` | App background / parchment base (all screens)     |
| `--color-primary`      | `#a57dee` | Jin Purple — primary CTA, active states, brand    |
| `--color-income`       | `#2ad2a3` | Jin Mint — income, positive states, Add button    |
| `--color-reward`       | `#feb704` | Amber — rewards, starburst accents, achievements  |
| `--color-alert`        | `#fc524f` | Tomato — overspending, alerts, delete actions     |
| `--color-goal`         | `#cce972` | Lime — savings goals, on-track progress           |
| `--color-story`        | `#cdb1e7` | Lavender — Story Mode screens, narrative elements |
| `--color-fun`          | `#fdb6f0` | Bubblegum — fun/leisure categories, playful tags  |
| `--color-ink`          | `#111008` | Ink Black — all borders, shadows, text on light bg|

### 2.2 Color Rules

- **`--color-base` (#fcfaeb)** is the skin of every screen. Never use pure white (#ffffff) as a background.
- **`--color-primary` (#a57dee)** is the identity color. Use for: primary buttons, active nav icons, onboarding hero backgrounds, selected row fills.
- **`--color-income` (#2ad2a3)** is the emotional counterpart to primary. Use for: income transactions, positive delta indicators, the Add (+) button background, savings confirmation states.
- **`--color-alert` (#fc524f)** is the only warning color. Never use decoratively. Reserve strictly for: overspending, error states, delete confirmations.
- **`--color-story` (#cdb1e7)** is exclusively for Story Mode / narrative screens. The Story nav icon also uses this color.
- **`--color-fun` (#fdb6f0)** is for fun/leisure transaction categories and personality tags only — never structural.
- **`--color-ink` (#111008)** replaces pure black everywhere. Slightly warm, far less harsh. Use for all borders, offset shadows, and body text on light backgrounds.

### 2.3 Semantic Color Mapping

| Context                  | Color Token         |
|--------------------------|---------------------|
| Primary CTA / button     | `--color-primary`   |
| Income transaction       | `--color-income`    |
| Expense / debit          | `--color-alert`     |
| Savings goal progress    | `--color-goal`      |
| Active nav item          | `--color-primary`   |
| Selected row highlight   | `--color-primary`   |
| Story Mode screens       | `--color-story`     |
| Fun/leisure category     | `--color-fun`       |
| Rewards / achievements   | `--color-reward`    |
| Starburst decorations    | Rotate: primary → income → reward → goal → fun |
| Danger / delete          | `--color-alert`     |
| App base background      | `--color-base`      |

### 2.4 Transaction Category Colors

Each spending category gets its own bold color chip in the UI (used in Money Map, transaction icons, category filters):

| Category         | Color     | Hex       |
|------------------|-----------|-----------|
| Food & drink     | Mint      | `#2ad2a3` |
| Transport        | Tangerine | `#f07030` |
| Income           | Mint      | `#2ad2a3` |
| Savings          | Lime      | `#cce972` |
| Bills            | Lavender  | `#cdb1e7` |
| Fun & leisure    | Bubblegum | `#fdb6f0` |
| Shopping         | Amber     | `#feb704` |
| Health           | Periwinkle| `#9090cc` |
| Subscriptions    | Deep Teal | `#208870` |
| Restaurants      | Gold      | `#f5a800` |
| Travel           | Sunflower | `#f0c000` |
| Other            | Parchment | `#fcfaeb` |

### 2.5 Color Vault (Available to Swap In)

These are saved alternates — not currently active in the app, but locked in for future use or seasonal themes. Each is a direct swap for an active color:

| Vault Name   | Hex       | Swaps With         |
|--------------|-----------|--------------------|
| Berry        | `#c0478a` | `--color-primary`  |
| Gold         | `#f5a800` | `--color-reward`   |
| Tangerine    | `#f07030` | `--color-alert`    |
| Sunflower    | `#f0c000` | Category highlight |
| Neon Yellow  | `#e8e800` | Category highlight |
| Crimson      | `#c02818` | `--color-alert` dark |
| Vermillion   | `#e04028` | `--color-alert`    |
| Hot Pink     | `#f06898` | `--color-fun`      |
| Blush        | `#f8b8cc` | `--color-fun` light|
| Deep Teal    | `#208870` | `--color-income` dark |
| Jungle       | `#28a050` | `--color-income`   |
| Periwinkle   | `#9090cc` | `--color-story`    |

---

## 3. Typography

### 3.1 Font Families

```css
--font-display: 'Barlow Condensed', sans-serif;  /* Hero numbers, big headlines */
--font-body:    'Space Grotesk', sans-serif;      /* Everything else */
```

**Never use:** Inter, Roboto, Arial, system-ui, or any generic sans-serif as a fallback in rendered UI. Always load both fonts from Google Fonts.

### 3.2 Type Scale

| Role              | Font              | Size   | Weight | Tracking      | Usage                                    |
|-------------------|-------------------|--------|--------|---------------|------------------------------------------|
| Hero / Balance    | Barlow Condensed  | 44–52px| 900    | -1px          | Total balance, hero numbers on dashboard |
| Section heading   | Barlow Condensed  | 26–32px| 700    | 0             | Screen titles, feature names             |
| Card heading      | Barlow Condensed  | 20–24px| 900    | 0             | Feature card titles (Money Map, Story)   |
| Body              | Space Grotesk     | 13–14px| 400    | 0             | Descriptions, narrative copy             |
| Body strong       | Space Grotesk     | 13–14px| 700    | 0             | Transaction names, emphasis              |
| Label / Meta      | Space Grotesk     | 9–10px | 700    | +2–2.5px      | UPPERCASE category labels, timestamps    |
| Button            | Space Grotesk     | 13–14px| 700    | 0             | All button text                          |
| Badge / Chip      | Space Grotesk     | 10–11px| 700    | 0             | Status badges, filter chips              |
| Stat label        | Space Grotesk     | 9–10px | 700    | +1.5px        | Labels above stat card values            |
| Stat value        | Barlow Condensed  | 28–34px| 900    | 0             | Numbers inside stat cards                |

### 3.3 Typography Rules

- Barlow Condensed is **only** for numbers and hero headlines — never for body copy or UI labels.
- Space Grotesk handles all functional text — labels, buttons, descriptions, navigation.
- Letter-spacing on uppercase labels: always +2 to +2.5px. Never uppercase without tracking.
- Line-height for body copy: 1.5–1.6. For display/hero: 1.0–1.1.
- Never use font-weight 600 or 700 on Space Grotesk body copy — use 700 only for labels, buttons, and names.

---

## 4. Spacing & Layout

### 4.1 Border Radius

| Context                  | Radius  |
|--------------------------|---------|
| Cards (main containers)  | 14px    |
| Buttons                  | 8px     |
| Chips / filter pills     | 20px (full pill) |
| Badges / status tags     | 20px (full pill) |
| Transaction icon boxes   | 8px     |
| Stat cards               | 12px    |
| Navigation bar           | 16px    |
| Onboarding card          | 20px    |
| Input fields             | 8px     |
| Stacked list rows        | 0 (except first/last: 10px top/bottom) |

### 4.2 Border Width

| Context                     | Width  |
|-----------------------------|--------|
| Main card border            | 2.5px  |
| Button border               | 2px    |
| Badge / chip border         | 1.5–2px|
| Transaction row border      | 2px    |
| Input field border          | 2px    |
| Navigation bar border       | 2.5px  |
| Onboarding card border      | 2.5px  |

All borders use `solid #111008` (Ink Black). No border should use gray or a color other than Ink Black, except dark-theme card borders which use `#333`.

### 4.3 Hard Offset Shadows (Neobrutalism Signature)

```css
--shadow-lg: 5px 5px 0 #111008;   /* Onboarding cards, hero elements */
--shadow-md: 4px 4px 0 #111008;   /* Main content cards              */
--shadow-sm: 3px 3px 0 #111008;   /* Buttons, small cards            */
--shadow-dark: 4px 4px 0 #555555; /* Dark background cards           */
```

**Rules:**
- Every card has a shadow. No card floats without one.
- Shadow direction is always bottom-right (positive x, positive y).
- Shadow color matches ink black on light backgrounds, `#555` on dark backgrounds.
- No `box-shadow` with blur radius — always `0` blur. No soft shadows anywhere.
- No `drop-shadow` CSS filter. No `text-shadow`.

### 4.4 Spacing Scale

```css
--space-xs:  4px
--space-sm:  8px
--space-md:  12px
--space-lg:  16px
--space-xl:  24px
--space-2xl: 32px
--space-3xl: 48px
```

- Card internal padding: `14px` (mobile), `16–20px` (tablet/web)
- Screen horizontal padding: `16px` (mobile), `24px` (web)
- Gap between cards in a grid: `10–12px`
- Gap between stat cards: `10px`

---

## 5. Components

### 5.1 Cards

**Standard card:**
```css
background: #fcfaeb;
border: 2.5px solid #111008;
border-radius: 14px;
padding: 14px;
box-shadow: 4px 4px 0 #111008;
```

**Color-filled card** (Primary / Mint / Lime / etc.):
- Same border and shadow rules
- Background becomes the semantic color
- Text on purple: white (#fff) for heading, `#e0ccff` for subtext
- Text on mint: `#111008` for heading, `#086b52` for subtext
- Text on lime: `#111008` for heading, `#4a6000` for subtext
- Text on amber: `#111008` for heading, `#6b4800` for subtext

**Dark card:**
```css
background: #111008;
border: 2.5px solid #333;
border-radius: 14px;
padding: 14px;
box-shadow: 4px 4px 0 #555;
```
- Heading: `--color-reward` (#feb704) or `--color-primary` (#a57dee)
- Body: `#888888`

### 5.2 Buttons

**Primary (purple):**
```css
background: #a57dee;
color: #ffffff;
border: 2px solid #111008;
border-radius: 8px;
padding: 8px 16px;
font: 700 13px 'Space Grotesk';
box-shadow: 3px 3px 0 #111008;
```

**Income (mint):**
```css
background: #2ad2a3;
color: #111008;
/* same border/shadow as primary */
```

**Dark / ink:**
```css
background: #111008;
color: #a57dee;  /* or #feb704 for reward context */
box-shadow: 3px 3px 0 #555555;
```

**Ghost / secondary:**
```css
background: #fcfaeb;
color: #111008;
/* border only, no shadow */
```

**Danger:**
```css
background: #fc524f;
color: #ffffff;
/* same border/shadow as primary */
```

**Rules:**
- No rounded pills on buttons — always 8px radius.
- No gradient backgrounds on any button.
- Hover state: translate(-1px, -1px), shadow becomes 4px 4px.
- Active/press state: translate(2px, 2px), shadow becomes 1px 1px.

### 5.3 Filter Chips

```css
/* Default */
background: #fcfaeb;
border: 2px solid #111008;
border-radius: 20px;
padding: 5px 12px;
font: 700 11px 'Space Grotesk';

/* Active chip */
background: #a57dee;
color: #ffffff;
```

Category-specific chips use the category color as background when active (mint for food, tangerine for transport, etc.).

### 5.4 Badges / Status Tags

```css
display: inline-block;
border: 1.5px solid #111008;
border-radius: 20px;
padding: 3px 10px;
font: 700 10px 'Space Grotesk';
```

| Status      | Background  | Text     |
|-------------|-------------|----------|
| Pending     | `#a57dee`   | `#fff`   |
| Income      | `#2ad2a3`   | `#111008`|
| Overspent   | `#fc524f`   | `#fff`   |
| On track    | `#cce972`   | `#111008`|
| Fun         | `#fdb6f0`   | `#111008`|
| Story       | `#cdb1e7`   | `#111008`|
| Reward      | `#feb704`   | `#111008`|
| Completed   | `#fcfaeb`   | `#111008`|

### 5.5 Transaction List

- Container: card with `border-radius: 14px`, `border: 2.5px solid #111008`, `box-shadow: 4px 4px 0 #111008`
- Each row: `border-bottom: 2px solid #111008`, no border-radius except first/last rows
- First row: `border-radius: 10px 10px 0 0`
- Last row: `border-radius: 0 0 10px 10px`, no bottom border
- Row height: `~50px` (padding `9px 12px`)
- Transaction icon: `32px × 32px`, `border-radius: 8px`, `border: 2px solid #111008`, category color fill
- Transaction name: Space Grotesk 700, 12px, `#111008`
- Category/date: Space Grotesk 400, 10px, `#666`
- Amount: Barlow Condensed 900, 17px — income uses `--color-income` text, expense uses `--color-alert` text
- **Active/selected row:** background `--color-primary` (#a57dee); name/amount text becomes white; category text becomes `#e0ccff`

### 5.6 Stat Cards

Grid of 2–4, `gap: 10px`.

```css
border: 2px solid #111008;
border-radius: 12px;
padding: 12px;
box-shadow: 3px 3px 0 #111008;
```

Internal structure:
- Label: Space Grotesk 700, 9px, `letter-spacing: 1.5px`, uppercase, muted color (matches card theme)
- Value: Barlow Condensed 900, 28–34px
- Sub-label: Space Grotesk 500, 10px

Variants: purple bg, mint bg, lime bg, amber bg, dark bg, parchment bg — see color rules in §2.1.

### 5.7 Progress Bars

```css
/* Track */
background: #ddd;
border: 2px solid #111008;
border-radius: 30px;
height: 13px;
overflow: hidden;

/* Fill */
height: 100%;
border-radius: 30px;
/* No border on fill — track border is enough */
```

Fill color maps to category or semantic meaning — never use a single color for all bars. Overspent bars use `--color-alert`.

### 5.8 Bottom Navigation Bar

```css
background: #fcfaeb;
border: 2.5px solid #111008;
border-radius: 16px;
padding: 10px 12px;
box-shadow: 4px 4px 0 #111008;
```

Nav items:
- Icon box: `34px × 34px`, `border-radius: 9px`, `border: 2px solid #111008`
- Default icon box bg: `#ffffff`
- Active icon box bg: `--color-primary` (#a57dee) — icon SVG becomes white
- Active indicator dot: `6px`, `background: --color-primary`, `border: 1.5px solid #111008`
- Labels: Space Grotesk 700, 9px, uppercase, `letter-spacing: 1px`
- Default label color: `#888`
- Active label color: `#111008`

**Nav items (in order):**
1. Home — bar chart icon
2. Map (Money Map) — clock/compass icon
3. Add — plus icon, mint bg always (most important action)
4. Story — line chart icon, lavender bg when active
5. Profile — person icon

### 5.9 Starburst Decorations

SVG star shapes used as decorative accents. Never from an icon library — always custom SVG paths.

| Size  | Use case                                          | Color options                    |
|-------|---------------------------------------------------|----------------------------------|
| 46px  | Hero decoration (onboarding, empty states)        | `--color-primary`                |
| 34px  | Section dividers, achievement badges              | `--color-income`, `--color-ink`  |
| 26px  | Inline detail accents                             | `--color-reward`                 |
| 20px  | Micro decorations                                 | `--color-goal`, `--color-fun`    |

All starbursts carry a `1.5px solid #111008` stroke. Always rotate through brand colors — never two adjacent starbursts the same color.

### 5.10 Feature Cards (Money Map, Story, Analytics)

Large illustrated cards that introduce each major feature. Structure:
- Full card background = feature's signature color (purple for Story, lavender for narrative, dark for Analytics)
- Left: outlined SVG illustration (56×56px), parchment fill inside, black outlines, 2.5px stroke
- Right: Barlow Condensed 900 title (22px), Space Grotesk 400 subtitle (11px)
- Illustration style: flat shapes with bold black outlines, no gradients, icons that feel handcrafted

---

## 6. Illustration Style

Inspired by Image 1 and Image 5 from our reference set.

### 6.1 Rules

- All illustrations use **bold black outlines** (2–3px stroke, `#111008`)
- Fills are flat — no gradients, no shadows inside illustrations
- Color fills come from the brand palette only
- Shapes are slightly organic/rounded — not perfectly geometric
- Illustrations should feel like they could break out of their container (overlap the card border slightly on key screens)
- Background fill inside illustration containers: always `#fcfaeb` (parchment)

### 6.2 Icon System

Transaction category icons are simple outlined SVG glyphs, 32×32px, placed inside colored `32×32px` icon boxes. The icon itself is always `#111008` stroke on the category color fill background.

Feature icons (Money Map, Story, Analytics, etc.) are more elaborate — 52–56px, mini illustrated compositions, not simple glyphs.

### 6.3 Onboarding Illustrations

Full onboarding/splash screens follow Image 5 energy:
- Background = `--color-primary` (#a57dee) full bleed
- Single centered illustration, 88–100px, parchment + mint + ink colors
- Barlow Condensed 900 headline, white, 34–38px, tight leading
- Space Grotesk body, `#e0ccff`, 12px, 1.5 line-height
- Single CTA button — mint background, full-width

---

## 7. Screen-Level Patterns

### 7.1 Dashboard / Home

- Background: `--color-base` (#fcfaeb)
- Top section: 2-col stat grid (balance + income, both colored stat cards)
- Transaction list below, scrollable
- Quick-add FAB or bottom nav Add button
- Starburst decoration (34px, amber) near the balance section

### 7.2 Money Map

- Background: `--color-base`
- D3/SVG visualization as main content — chart colors map to category colors
- Filter chips above chart for category filtering
- Chart bars use pill shape (rounded top and bottom) not rectangles — inspired by Image 3

### 7.3 Story Mode

- Background: `--color-story` (#cdb1e7) — this is the one screen that breaks from parchment
- Editorial layout: large Barlow Condensed headline, Space Grotesk narrative body
- Minimal UI chrome — let the text breathe
- Starburst (46px, lavender/ink) as decorative punctuation

### 7.4 Analytics

- Dark card sections against parchment base
- Barlow Condensed 900 for all data numbers
- Chart colors follow category color map (§2.4)

### 7.5 Onboarding Flow

- Each screen: full `--color-primary` background
- One illustration, one headline, one subline, one CTA
- Progress dots at bottom: ink black, small, no labels

---

## 8. Motion & Interaction

- Button hover: `translate(-1px, -1px)`, shadow expands to `4px 4px`
- Button press: `translate(2px, 2px)`, shadow shrinks to `1px 1px`
- Card entrance: `fadeInUp` — 200ms, ease-out, stagger 40ms between siblings
- Page transitions: slide (horizontal for drill-down, vertical for modal sheets)
- Tab/nav switch: no animation on icon, label fades in at 150ms
- No spring physics — transitions are fast and direct, not bouncy
- No blur animations — they flash during render

---

## 9. What to Never Do

- ❌ Pure white (#ffffff) as any screen background
- ❌ Soft box shadows with blur radius
- ❌ Gradients anywhere — backgrounds, buttons, cards, illustrations
- ❌ Glassmorphism / backdrop-filter / blur effects
- ❌ Rounded pill buttons (buttons are 8px radius, pills are for chips only)
- ❌ Inter, Roboto, Arial, or system fonts in any rendered UI
- ❌ More than one colored background on the same screen (except Story Mode)
- ❌ Gray borders — all borders are `#111008` or `#333` on dark backgrounds
- ❌ Multiple competing accent colors on a single component
- ❌ `border-radius > 20px` on anything that isn't a pill/chip
- ❌ Font weight 600 — use 400 or 700 only
- ❌ Text shadows or decorative text effects
- ❌ Animation duration over 300ms for UI transitions

---

## 10. CSS Token Reference

Paste this into your global token file (`tokens.css` / `tokens.ts` / `tailwind.config.js`):

```css
:root {
  /* === CORE COLORS === */
  --color-base:       #fcfaeb;
  --color-primary:    #a57dee;
  --color-income:     #2ad2a3;
  --color-reward:     #feb704;
  --color-alert:      #fc524f;
  --color-goal:       #cce972;
  --color-story:      #cdb1e7;
  --color-fun:        #fdb6f0;
  --color-ink:        #111008;

  /* === VAULT COLORS (not active — available to swap) === */
  --vault-berry:      #c0478a;
  --vault-gold:       #f5a800;
  --vault-tangerine:  #f07030;
  --vault-sunflower:  #f0c000;
  --vault-neon-yel:   #e8e800;
  --vault-crimson:    #c02818;
  --vault-vermillion: #e04028;
  --vault-hot-pink:   #f06898;
  --vault-blush:      #f8b8cc;
  --vault-deep-teal:  #208870;
  --vault-jungle:     #28a050;
  --vault-periwinkle: #9090cc;

  /* === CATEGORY COLORS === */
  --cat-food:         #2ad2a3;
  --cat-transport:    #f07030;
  --cat-savings:      #cce972;
  --cat-bills:        #cdb1e7;
  --cat-fun:          #fdb6f0;
  --cat-shopping:     #feb704;
  --cat-health:       #9090cc;
  --cat-subs:         #208870;
  --cat-restaurants:  #f5a800;
  --cat-travel:       #f0c000;
  --cat-other:        #fcfaeb;

  /* === TYPOGRAPHY === */
  --font-display:     'Barlow Condensed', sans-serif;
  --font-body:        'Space Grotesk', sans-serif;

  /* === BORDERS === */
  --border-ink:       2.5px solid #111008;
  --border-btn:       2px solid #111008;
  --border-badge:     1.5px solid #111008;

  /* === SHADOWS === */
  --shadow-lg:        5px 5px 0 #111008;
  --shadow-md:        4px 4px 0 #111008;
  --shadow-sm:        3px 3px 0 #111008;
  --shadow-dark:      4px 4px 0 #555555;

  /* === BORDER RADIUS === */
  --radius-card:      14px;
  --radius-btn:       8px;
  --radius-pill:      20px;
  --radius-icon:      8px;
  --radius-stat:      12px;
  --radius-nav:       16px;
  --radius-onboard:   20px;

  /* === SPACING === */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
}
```

---

*Last updated: April 2026 — generated from Jinsight design sessions with Claude.*
*This file lives at `/DESIGN.md` in the project root alongside `CLAUDE.md`.*
*Update the "Last updated" date whenever a design decision changes.*
