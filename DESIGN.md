# DESIGN.md — QueueOS Visual & Interaction Rulebook
# Swiss Triage / Operational Command Desk Specification
# Version 1.0 — Rugas Technologies Queue Management System

---

## 0. The Design DNA (Why This Looks The Way It Looks)

QueueOS draws from three physical world references fused into a single digital language:

1. **Swiss Hospital Triage Desk** — Information hierarchy is a matter of urgency and life, not decoration. Every pixel earns its place. The board on the wall tells you exactly who is next and nothing else.
2. **Braun Physical Instrument Panel** — Dieter Rams' "less but better." A chronograph face with a monospace digit. Tick marks instead of gradient fills. Matte aluminum panel instead of plastic chrome.
3. **Linear's Operational Command Center** — The inverted-L app shell. High-density 44–48px rows with 1px hairlines. A single Vermilion accent reserved for the one primary action. Keyboard-first ergonomics.

The result: **a manager sitting at this interface should feel like they are operating professional equipment, not using consumer SaaS.**

---

## 1. Aesthetic Direction

- **Core Principle:** Flat, high-contrast, zero-fluff utility. Information hierarchy is driven entirely by typography scale, tabular numbers, and `1px` hairline borders — NEVER drop shadows or gradients.
- **Spatial Metaphor:** The screen is a physical desk surface. The left sidebar is the pinboard of open queues. The main area is the active work surface. The top bar is the status strip on the front of the instrument.
- **Motion Metaphor:** Everything moves like a mechanical split-flap airport display — crisp, purposeful, physics-informed. Nothing bounces. Nothing floats. Nothing fades without reason.

---

## 2. Strict Negative Constraints (BANNED — Zero Exceptions)

### Geometry & Elevation
- **NO** `border-radius` above `6px` on any container, panel, or input group.
- **NO** `border-radius` above `4px` on buttons, inputs, tags, or status chips.
- **NO** `box-shadow` on cards, rows, or structural panels. The only permitted shadow is `0 4px 12px rgba(0,0,0,0.06)` on floating command palette / dropdown menus — and that must be paired with a `1px solid var(--border-hairline)` border.
- **NO** nested cards inside cards. Use `1px` hairline dividers and controlled whitespace.
- **NO** floating card grids for the queue list. Use flat rows with `border-bottom: 1px solid var(--border-hairline)`.

### Color & Decoration
- **NO** CSS gradients (`linear-gradient`, `radial-gradient`, `conic-gradient`) anywhere in the UI.
- **NO** glassmorphism (`backdrop-filter: blur`) or frosted glass panels.
- **NO** neon glow accents or colored drop shadows.
- **NO** decorative icon boxes — colored `40×40px` rounded squares containing a Lucide icon — next to KPI or stat titles.
- **NO** pastel pill badges (`rounded-full bg-blue-100 text-blue-700`) for every metadata field. Use `4px`-radius rectangular status tags with a `6px` solid dot.
- **NO** purple, indigo, violet, or multi-stop gradients anywhere.
- **NO** pattern fills, background textures, or decorative SVG blobs.

### Typography & Motion
- **NO** variable-width numbers for token IDs, wait timers, counters, or analytics metrics. ALL numbers must use `font-variant-numeric: tabular-nums`.
- **NO** `font-size` above `32px` for UI chrome (page headers, section titles).
- **NO** `ALL CAPS` labels via `text-transform: uppercase` on body copy or navigation items. Reserve for `letter-spacing: 0.08em` section micro-labels only, used sparingly.
- **NO** `scale-105` or `scale-110` hover transformations on rows or cards.
- **NO** bouncy spring animations (`stiffness < 200`). Use critically damped physics (stiffness: 500, damping: 38, mass: 0.8).
- **NO** transition durations above `280ms` for state changes. Keep it mechanical.

---

## 3. Typography System

### Typeface Stack
```
UI Sans:    "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif
Data Mono:  "JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace
```

### Rules
- **JetBrains Mono is mandatory** for: Token IDs (`A-014`), queue position numbers (`#01`), wait timers (`08m 42s`), all analytics metric values, and any counter that changes live.
- `font-variant-numeric: tabular-nums` on **every** monospace element.
- `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` on Plus Jakarta Sans / Inter for disambiguation.
- Tight tracking (`letter-spacing: -0.02em`) on headings `≥ 18px`.
- Normal tracking on body copy and UI labels.

### Type Scale
| Token          | Size     | Weight | Family      | Use |
|----------------|----------|--------|-------------|-----|
| `--text-xs`    | 11px     | 500    | UI Sans     | Timestamps, micro-labels |
| `--text-sm`    | 13px     | 400    | UI Sans     | Secondary labels, notes |
| `--text-base`  | 14px     | 400    | UI Sans     | Body, row content |
| `--text-md`    | 15px     | 500    | UI Sans     | Row names (primary cell) |
| `--text-lg`    | 16px     | 600    | UI Sans     | Section headers, queue title |
| `--text-xl`    | 20px     | 600    | UI Sans     | Page-level heading |
| `--text-token` | 15px     | 700    | Mono        | Token IDs in rows |
| `--text-kpi`   | 28px     | 700    | Mono        | KPI metric values |
| `--text-timer` | 14px     | 500    | Mono        | Live timers |
| `--text-pos`   | 13px     | 600    | Mono        | Position index (`#01`) |

---

## 4. Color System — Warm Alabaster & Signal Vermilion

### Surface Scale (Zero Blue Undertone)
```css
--bg-canvas:        #F7F7F5;   /* Outer app frame, sidebar — warm architectural paper */
--bg-surface:       #FFFFFF;   /* Active queue list, elevated work surface */
--bg-hover:         #F1F0EC;   /* Row hover tint */
--bg-active-row:    #EBEAE4;   /* Selected queue in sidebar */
--bg-serving:       #FEF5F1;   /* Currently Serving banner background */
--bg-input:         #FAFAF9;   /* Input field fill */
```

### Border Scale
```css
--border-hairline:  #E4E3DD;   /* Primary 1px structural dividers */
--border-strong:    #CFCBC2;   /* Input borders, button outlines */
--border-serving:   #F5C7B8;   /* 1px border on serving banner */
--border-focus:     #D9481E;   /* Focus ring color */
```

### Ink / Typography Hierarchy
```css
--text-primary:     #181816;   /* Warm charcoal — richer than pure #000 */
--text-secondary:   #57554E;   /* Sub-labels, table headers, nav items */
--text-muted:       #8C8980;   /* Timestamps, hints, disabled states */
--text-on-accent:   #FFFFFF;   /* Text on Vermilion CTA button */
```

### Brand Accent & Semantic Tokens
```css
--accent-primary:         #D9481E;   /* Signal Vermilion — ONLY for primary CTA + active nav */
--accent-primary-hover:   #BF3B15;   /* Pressed/hover state */
--accent-secondary:       #1D4ED8;   /* Cobalt — secondary actions, links */
--accent-secondary-hover: #1E40AF;

--status-serving-bg:      #F0FDFA;   /* SERVING token surface */
--status-serving-text:    #0F766E;   /* SERVING token text */
--status-serving-border:  #99F6E4;   /* SERVING token 1px border */

--status-waiting-text:    #181816;   /* WAITING — primary ink, no color treatment */

--status-cancelled-text:  #B91C1C;   /* CANCELLED text */
--status-cancelled-bg:    #FEF2F2;   /* CANCELLED light surface (analytics only) */

--status-completed-text:  #166534;   /* COMPLETED text */
--status-completed-bg:    #F0FDF4;   /* COMPLETED light surface */

--status-danger:          #B91C1C;   /* Destructive actions at hover */
--status-danger-hover:    #991B1B;
```

---

## 5. Geometry & Spacing

### Border Radius
```
Buttons, inputs, status tags:   4px  (border-radius: 4px)
Containers, panels, modals:     6px  (border-radius: 6px)
Status indicator dots:          50%  (the ONLY fully rounded element)
```

### Spacing Grid
Base unit: `4px`. All spacing must be multiples of 4px.
```
4px   — icon internal padding, tight gutter
8px   — element-to-label gap
12px  — compact row vertical padding
16px  — panel internal padding (default)
20px  — section gap within panel
24px  — section separator
32px  — major layout gap
```

### App Shell Geometry (1440×900 reference)
| Zone                     | Dimension           | Notes |
|--------------------------|---------------------|-------|
| Left Sidebar             | Fixed 240px         | Collapses to slide-over drawer < 768px |
| Top Action Bar           | Fixed 52px          | 1px border-bottom only |
| Quick-Add Entry Bar      | Fixed 48px          | Pinned below top bar, inline entry |
| Currently Serving Banner | 64px height         | Full-width, `--bg-serving` tint |
| Waiting Token Rows       | 44px height         | 12–14 tokens visible above fold |
| Analytics KPI Strip      | Auto (≈ 72px)       | 3–4 equal columns with 1px vertical dividers |

### Row Column Distribution (Queue Workspace)
```
88px   — Token ID (JetBrains Mono, tabular)
1fr    — Person Name + optional notes
96px   — Wait Timer (JetBrains Mono)
108px  — Actions (↑ ↓ ×) — opacity 0.6 at rest, 1.0 on row hover
```

---

## 6. Component Specification

### Sidebar Queue Item
```
Height: 36px
Padding: 0 12px
Layout: flex, items-center, gap 8px
Active state: 2px Signal Vermilion left border + --bg-active-row fill
Queue count badge: 20px × 18px rectangle, 4px radius, --bg-hover fill, --text-secondary, JetBrains Mono
```

### Top Bar
```
Height: 52px
Padding: 0 16px
Border: 1px solid var(--border-hairline) bottom only
Left: QueueOS wordmark (14px, weight 700, JetBrains Mono) + workspace name
Right: Nav links + Manager avatar (28px circle, no shadow)
```

### Primary CTA Button — "Assign Next Token"
```
Height: 32px
Padding: 0 14px
Background: var(--accent-primary)
Text: 13px, weight 600, --text-on-accent
Border-radius: 4px
Hover: var(--accent-primary-hover)
Disabled: opacity 0.4, cursor not-allowed
Transition: background-color 120ms ease-out
```

### Secondary Button
```
Height: 32px
Padding: 0 12px
Background: transparent
Border: 1px solid var(--border-strong)
Text: 13px, weight 500, --text-primary
Hover: --bg-hover background
Border-radius: 4px
```

### Token Row (Waiting)
```
Height: 44px
Border-bottom: 1px solid var(--border-hairline)
Background: --bg-surface
Hover: background --bg-hover, transition 120ms ease-out
Row actions opacity: 0.6 → 1.0 on hover (120ms)
```

### Currently Serving Banner
```
Height: 64px
Background: var(--bg-serving)
Border-bottom: 2px solid var(--border-serving)
Token ID: 20px, JetBrains Mono, weight 700, --status-serving-text
Timer: live-updating, JetBrains Mono
```

### Quick-Add Bar
```
Height: 48px
Padding: 0 16px
Border-bottom: 1px solid var(--border-hairline)
Input: borderless within bar, placeholder --text-muted
Submit: 28px × 28px icon button, 4px radius
```

### Status Tags (Analytics & Token Detail)
```
Serving:   background --status-serving-bg, text --status-serving-text, 
           border 1px solid --status-serving-border
Waiting:   background --bg-surface, text --text-primary,
           border 1px solid --border-hairline
Cancelled: background --status-cancelled-bg, text --status-cancelled-text,
           no border
Completed: background --status-completed-bg, text --status-completed-text,
           no border
Tag padding: 4px 8px, font 11px weight 500, border-radius 4px
```

### Dot Status Indicator
```
Width/Height: 6px
Border-radius: 50%
Serving:   #0F766E
Waiting:   #8C8980
Cancelled: #B91C1C
Completed: #166534
```

---

## 7. Motion & Animation Architecture

### Core Principle
Every animation is **functional, not decorative**. It answers "what changed?" — not "look how smooth this is."

### Physics Preset (Critically Damped — Never Bouncy)
```
Stiffness: 500  |  Damping: 38  |  Mass: 0.8
Duration cap: 280ms max for state changes
Hover/microinteraction: 120ms ease-out
Row exit: 140ms ease-in
```

### Animation Stack by Layer

**Layer 1: GSAP + Flip Plugin**
- Used for: Queue row reordering (move up/down), token promotion to Serving banner, token exit on cancel/complete
- Why: DOM coordinate inversion handles interrupted rapid-clicks without row jitter

**Layer 2: NumberFlow (`@number-flow/react`)**
- Used for: Waiting count badge, live serving timer, all KPI metric values in analytics
- Why: Individual digit reels with tabular-nums — no layout shift on live updates

**Layer 3: Native View Transitions API**
- Used for: `/queues` ↔ `/analytics` route switching
- Why: Zero bundle size, compositor-thread crossfade with shared element morphing

**Layer 4: Visx + GSAP Timeline**
- Used for: Analytics bar charts, area charts
- Why: Custom 1px SVG strokes, GSAP path-drawing, no Recharts default chrome

### Screen-Level Motion Map
| Screen / Interaction | Engine | Exact Behavior |
|---|---|---|
| Login form entrance | CSS `@starting-style` | opacity: 0, y: 6 → y: 0 in 180ms |
| Login error shake | Web Animations API | x: [-4, 4, -3, 3, 0] in 220ms |
| Queue sidebar switch | GSAP Flip `layoutId` | 2px Vermilion indicator glides between items |
| Add token (Enter) | GSAP Flip `onEnter` | New row slides in from y: -10, opacity 0 → 1 in 180ms |
| Move Up / Move Down | GSAP Flip `layout` | Adjacent rows swap vertical position in 200ms |
| Assign Top Token | GSAP Flip cross-container | Top row morphs into Serving banner in 240ms |
| Cancel / Complete | GSAP Flip `onLeave` | Row translates x: +16, fades to 0 in 140ms; gap closes |
| Route switch | View Transitions API | 150ms crossfade, shared `view-transition-name` |
| KPI metric update | NumberFlow | Individual digit rolls vertically, tabular-nums |
| Analytics bar mount | Visx + GSAP | scaleY from 0 → 1, 0.025s stagger per bar column |
| Analytics filter change | Visx + GSAP | Bar heights morph smoothly on date range switch |

---

## 8. Layout Wireframe

```
+-----------------------------------------------------------------------------------+
| QueueOS  ·  Rugas Desk                    [Queues]  [Analytics]     [RM avatar]  |  52px
+-------------------+---------------------------------------------------------------+
| QUEUES        240px|  General Consultation              [+ Add Token]  [Assign →] |  52px
|                   |---------------------------------------------------------------|
| ● Gen. Consult    |  SERVING  A-014  Rohan Sharma  08m 42s  [Complete] [Cancel]   |  64px
|   12 waiting      |---------------------------------------------------------------|
|                   |  [ Person name...           ]  [ Phone (opt) ]  [ + Issue ]   |  48px
|   Billing Desk    |---------------------------------------------------------------|
|   4 waiting       |  WAITING LINE (12)                                            |
|                   |  #01 | A-015 | Priya Nair          | 06m 14s | ↑  ↓  ×      |  44px
|   VIP Support     |  #02 | A-016 | Karthik Rao         | 04m 02s | ↑  ↓  ×      |  44px
|   0 waiting       |  #03 | A-017 | Ananya Hegde        | 01m 55s | ↑  ↓  ×      |  44px
|                   |  #04 | A-018 | Dev Patel           | 00m 48s | —  ↓  ×      |  44px
| [+ New Queue]     |  ...                                                           |
+-------------------+---------------------------------------------------------------+
```

---

## 9. Analytics Layout Spec

```
+-----------------------------------------------------------------------------------+
| QueueOS  ·  Rugas Desk                    [Queues]  [Analytics]     [RM avatar]  |
+-------------------+---------------------------------------------------------------+
| QUEUES        240px|  Analytics              [All Queues ▾]  [Today ▾]  [Export] |
|                   |---------------------------------------------------------------|
|                   |   Avg Wait   |  Tokens Served  |  Active Now  |  Cancel Rate  |
| (same sidebar)    |   12.4 min   |      47         |     3        |    8.5%       |
|                   |---------------------------------------------------------------|
|                   |  QUEUE LENGTH OVER TIME (bar chart)  |  TOKEN OUTCOMES (donut)|
|                   |  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        |  ● Completed 78%       |
|                   |                                      |  ● Cancelled  8%       |
|                   |                                      |  ● Waiting   14%       |
|                   |---------------------------------------------------------------|
|                   |  HOURLY TOKEN INFLOW (area chart)                             |
+-------------------+---------------------------------------------------------------+
```

---

## 10. Empty States

### No Queues (First Login)
- Large centered JetBrains Mono "0" in `--text-muted`
- Single line: "No queues yet" in `--text-secondary`
- Primary Vermilion CTA: "Create first queue"
- No illustration, no decorative SVG blob

### Empty Queue (0 Waiting)
- Row area shows: "Queue is empty" in `--text-muted`, 13px, centered vertically
- "Assign Next Token" button disabled (opacity 0.4)
- Quick-Add bar remains active and focused

### No Analytics Data
- Chart area shows hairline grid with no bars
- KPI values: `—` in `--text-muted` (not `0` or `NaN`)

---

## 11. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| ≥ 1280px | Full 240px fixed sidebar, all columns visible |
| 1024–1279px | Sidebar 200px, actions column tighter |
| 768–1023px | Sidebar collapses to icons only (40px) |
| < 768px | Sidebar becomes slide-over drawer, single column layout |

---

## 12. Accessibility Baseline

- Focus rings: `2px solid var(--border-focus)` offset `2px`, never removed
- Keyboard: `↑ ↓` arrows navigate queue rows; `Enter` submits Quick-Add; `Escape` closes any drawer/modal
- ARIA: `role="listitem"` on token rows, `aria-label` on icon-only buttons, `aria-live="polite"` on queue count and serving banner
- Reduced motion: All GSAP/NumberFlow animations wrapped in `prefers-reduced-motion: reduce` media query override → instant state change
- Color contrast: All text/background combinations ≥ 4.5:1

---

*End of DESIGN.md — QueueOS v1.0 — Rugas Technologies*

