---
name: Swiss Operational Command Desk
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#5a413a'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#8e7069'
  outline-variant: '#e2bfb5'
  surface-tint: '#b22c00'
  primary: '#ad2b00'
  on-primary: '#ffffff'
  primary-container: '#d14219'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a1'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#005f9d'
  on-tertiary: '#ffffff'
  tertiary-container: '#0078c5'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a1'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#882000'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497b'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
  bg-canvas: '#F7F7F5'
  bg-surface: '#FFFFFF'
  bg-hover: '#F1F0EC'
  bg-active-row: '#EBEAE4'
  bg-serving: '#FEF5F1'
  bg-input: '#FAFAF9'
  border-hairline: '#E4E3DD'
  border-strong: '#CFCBC2'
  border-serving: '#F5C7B8'
  border-focus: '#D9481E'
  text-primary: '#181816'
  text-secondary: '#57554E'
  text-muted: '#8C8980'
  text-on-accent: '#FFFFFF'
  accent-primary-hover: '#BF3B15'
  accent-primary-active: '#A33110'
  status-serving-bg: '#F0FDFA'
  status-serving-text: '#0F766E'
  status-serving-border: '#99F6E4'
  status-cancelled-bg: '#FEF2F2'
  status-cancelled-text: '#B91C1C'
  status-completed-bg: '#F0FDF4'
  status-completed-text: '#166534'
typography:
  headline-kpi:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 28px
  headline-kpi-mobile:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.02em
  banner-token:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-default:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
  body-row-primary:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
  body-mono-token:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-timer:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-mono-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system draws direct inspiration from Swiss hospital triage stations, Braun instrument panels (Dieter Rams' "less, but better"), and high-density operational command consoles. It functions strictly as professional physical equipment translated into software—every element, pixel, and typographic style earns its position through operational necessity, rapid readability, and strict spatial economy.

The brand personality is clinical, authoritative, understated, and uncompromisingly utilitarian. The interface addresses high-pressure dispatchers, triage leads, and operations managers who require immediate cognitive clarity under stress. The intended emotional response is steady, decisive focus: zero ambiguity, zero aesthetic friction, and total ergonomic confidence.

The design movement combines Swiss High-Contrast Minimalism with Structural Grid Brutalism:
- Flat, high-contrast, border-delineated layouts that eliminate drop shadows, glassmorphism, and color gradients entirely.
- Architectural surface materials: warm alabaster paper canvas paired with surgical white workspaces.
- Singular high-visibility chromatic discipline: Signal Vermilion is strictly quarantined for primary calls-to-action, active workspace beacons, and critical focus rings.
- Monospaced tabular data density paired with crisp neo-grotesque structural typography.

## Colors

The color architecture is built exclusively for light mode. Dark mode is intentionally unsupported to preserve print-grade paper contrast and daylit situational readability.

### Surface Hierarchy
The spatial experience is defined by two foundational materials:
- **Canvas Base (`#F7F7F5`)**: An unbleached, architectural alabaster paper tone used for outer application shells, fixed utility frames, sidebars, and ambient negative space. It grounds the UI without harsh digital glare.
- **Work Surface (`#FFFFFF`)**: Pure medical white reserved for active task areas—queue tables, ticket lists, form fields, and modal containers.
- **Interactive Shifts (`#F1F0EC` to `#EBEAE4`)**: Micro-tonal neutral shifts provide immediate, low-noise feedback on row hovers and selected states without introducing color casts.

### Brand & Functional Accent Rules
- **Signal Vermilion (`#D9481E`)**: The sole dominant focal accent. It is strictly constrained to the primary single action (e.g., "Assign Next Token"), active navigation indicators, and keyboard focus outlines. It must never be applied decoratively, on background panels, or on non-essential buttons.
- **Secondary Cobalt (`#1D4ED8`)**: Subdued secondary action accent, informational links, and utility notices.

### Semantic Triage Status
Status colors utilize muted pastel fills paired with high-contrast, deeply saturated text and precise borders:
- **Serving / Active (`#0F766E` on `#F0FDFA` / border `#99F6E4`)**: Teal surgical precision denoting active engagement.
- **Cancelled / Danger (`#B91C1C` on `#FEF2F2`)**: Deep crimson indicating dropped or destructive events.
- **Completed / Resolved (`#166534` on `#F0FDF4`)**: Evergreen indicating closed triage items.
- **Waiting (`#181816` on `#FFFFFF`)**: Completely neutral; queued items rely on charcoal ink hierarchy rather than artificial warning tints.

## Typography

The typography system enforces a dual-stack operational taxonomy:
1. **Structural Neo-Grotesque (`Plus Jakarta Sans`)**: Applied to all labels, navigation links, section titles, and narrative data. Features tight tracking (`-0.02em`) on headers above `16px`. Font feature settings `cv02`, `cv03`, `cv04`, and `cv11` are enabled to eliminate character confusion (e.g., differentiating uppercase I, lowercase l, and number 1).
2. **Tabular Instrument Monospace (`JetBrains Mono`)**: Mandatory for all operational metrics, queue tokens (`A-014`), wait timers (`08m 42s`), position indexes (`#01`), and live telemetry.

### Typographic Constraints
- Every numeric string rendered in `JetBrains Mono` must declare `font-variant-numeric: tabular-nums` to prevent horizontal jitter during real-time split-flap or digital ticker updates.
- Maximum UI type size is capped at `28px` for KPIs (`48px` exclusively for zero-state numbers). Decorative, oversized display headings are forbidden.
- All-caps styling is strictly restricted to `11px` micro-labels with `0.04em`–`0.06em` tracking. Body copy and action buttons must never use all-caps.

## Layout & Spacing

The layout is built around a rigorous 4px mechanical base unit (`0.25rem`), prioritizing high-density situational visibility. A triage operator must observe 12–14 active waiting tokens above the desktop fold without scrolling.

### Application Frame & Shelving
The workspace follows an inverted-L instrument shell:
- **Top Command Strip**: Fixed `52px` height, spanning full width with a bottom `1px solid #E4E3DD` boundary.
- **Operational Sidebar**: Fixed `240px` width on standard screens, pinned left.
- **Sub-Header Action Shelves**: Quick-Add entry bar is pinned at `48px` height; the Currently Serving status banner occupies a prominent `64px` height.
- **Queue Table Rows**: Fixed `44px` height each, aligned flush with `1px` bottom borders.

### Column Grid Specifications
In the main queue workspace, horizontal space conforms to rigid metric columns:
- Position Cell: Fixed `32px`
- Token Identifier Cell: Fixed `88px`
- Operator / Person Name: Flexible `1fr`
- Elapsed Wait Timer: Fixed `96px`
- Contextual Action Triggers: Fixed `108px`

### Responsive Breakpoint Mechanics
- **Desktop (≥ 1280px)**: 240px persistent sidebar, standard 44px rows, all secondary metrics visible.
- **Compact Desktop (1024px – 1279px)**: Sidebar shrinks to 200px; padding in the actions column tightens.
- **Tablet (768px – 1023px)**: Sidebar collapses into a 40px icon strip; data cells retain tabular alignment.
- **Mobile (< 768px)**: Sidebar transitions to an off-canvas drawer (`240px`). Work surface conforms to single-column stack. Non-critical action triggers hide behind row taps.

## Elevation & Depth

This design system uses a strictly flat, architectural layering model. Elevation is established exclusively through surface tonal separation and hairline division—never ambient blur or elevation drop shadows.

### Elevation Principles
- **No Box Shadows on Workspace Surfaces**: Flat cards, queue rows, summary bars, and KPI modules must never feature drop shadows or colored ambient glows.
- **Structural Hairlines**: Visual separation is achieved via `1px solid #E4E3DD` borders. Panels, rows, and cells snap together in an un-extruded grid.
- **Two Tonal Layers**:
  - `Base`: Canvas background (`#F7F7F5`) acts as the structural tray.
  - `Layer 1`: Active work surface (`#FFFFFF`) sits directly flush on the tray, demarcated by hairline edges.

### Transient Floating Overlays
The only exceptions to the zero-shadow rule are floating system-level overlays:
- **Modals / Dialogs**: Positioned at `z-index: 50`. Bordered with `1px solid #CFCBC2` and grounded with `0 1px 0 #E4E3DD, 0 8px 24px rgba(0, 0, 0, 0.08)`. Backed by an opaque charcoal veil (`rgba(24, 24, 22, 0.40)`).
- **Toast Notifications & Command Menus**: Positioned at `z-index: 60` and `40` respectively. Supported by `0 1px 0 #E4E3DD, 0 4px 12px rgba(0, 0, 0, 0.06)` combined with a `1px solid #E4E3DD` border.
- **Active Navigation Marker**: An absolute `2px` Signal Vermilion indicator bar placed on the active edge, avoiding drop-shadow glow.

## Shapes

The geometric form language is sharp, crisp, and mechanical. Curvature is kept minimal to maintain the feel of physical sheet metal and calibrated machinery.

### Corner Radius System
- **Containers, Panels & Modals (`6px`)**: The maximum corner radius permitted anywhere in the system. Modals, cards, floating panes, and workspace containers never exceed 6px.
- **Interactive Controls & Tags (`4px`)**: Applied to all primary and secondary buttons, form inputs, status tags, sidebar counter pills, and table action buttons.
- **Status Indicator Dots (`50%` / Circular)**: Circular styling is exclusively reserved for 6px status dots (`.status-dot`) and circular operator avatars (`28px`).
- **Forbidden**: Pill-shaped inputs (`rounded-full`), decorative icon badges, and large rounded cards (`rounded-xl` / `rounded-2xl`) are strictly prohibited.

## Components

### Buttons
- **Primary Action (Call to Action)**: Fixed height `32px` (standard) or `36px` (large). Solid Signal Vermilion (`#D9481E`) fill with `#FFFFFF` text (`13px`, weight `600`). Border radius `4px`. Zero shadow. Hover transitions to `#BF3B15` over `120ms ease-out`. Focus ring: `2px solid #D9481E` with `2px` offset.
- **Secondary / Ghost Button**: Height `32px`, transparent background, `1px solid #CFCBC2` border, `#181816` text (`13px`, weight `500`). Hover: `#F1F0EC` background.
- **Icon / Utility Buttons**: Fixed footprint of `28px × 28px`, `4px` radius. Resting state uses `#8C8980` icon stroke at `0.6` opacity; increases to `1.0` opacity and `#181816` on hover.

### Status Chips & Tags
- Rectangular `4px` radius with `4px 8px` internal padding. Type: `11px`, weight `500`. No pill radii.
- **Serving**: Background `#F0FDFA`, text `#0F766E`, border `1px solid #99F6E4`.
- **Waiting**: Background `#FFFFFF`, text `#181816`, border `1px solid #E4E3DD`.
- **Cancelled**: Background `#FEF2F2`, text `#B91C1C`, borderless.
- **Completed**: Background `#F0FDF4`, text `#166534`, borderless.
- Every status chip can be paired with an inline `6px × 6px` circular status dot.

### Queue Table Rows
- Height `44px`, background `#FFFFFF`. Bottom border `1px solid #E4E3DD`.
- Cells must use monospace tabular alignment for token ID (`JetBrains Mono`, weight `700`, `15px`) and live wait timer (`JetBrains Mono`, weight `500`, `13px`).
- Row hover produces instant `#F1F0EC` fill; row actions reveal from `0.6` to `1.0` opacity.

### Currently Serving Banner
- Prominent operational beacon occupying `64px` height with `#FEF5F1` background tint and `2px solid #F5C7B8` bottom border.
- Displays token ID at `20px` bold (`JetBrains Mono`), patient/client name in `15px` medium (`Plus Jakarta Sans`), and live timer in tabular monospace.

### Form Inputs & Quick-Add Entry
- Standalone inputs feature height `32px` or `36px`, fill `#FAFAF9`, and border `1px solid #CFCBC2` with `4px` radius. Placeholder text is `#8C8980`. Focus state triggers `1px solid #D9481E` border and `2px` Vermilion focus ring.
- **Quick-Add Bar**: Inline horizontal strip pinned below the top bar (`48px` height). Borderless input fields resting on `#FFFFFF` with `1px solid #E4E3DD` bottom border. Submits via an integrated `28px × 28px` icon trigger.

### Cards & Analytical Panels
- Background `#FFFFFF` with `1px solid #E4E3DD` perimeter border and `6px` radius. Zero shadow.
- KPI modules feature an `11px` uppercase tracking header (`#57554E`) and a bold `28px` tabular monospace metric value (`#181816`). Internal cell divisions use vertical `1px solid #E4E3DD` rules.

### Checkboxes & Radios
- Checkboxes: `14px × 14px`, `3px` radius, `1px solid #CFCBC2` resting border. Checked state uses solid `#181816` fill with pure white checkmark.
- Radio buttons: `14px × 14px`, circular, with `1px solid #CFCBC2` outer border; active state houses a solid `6px` inner circle.