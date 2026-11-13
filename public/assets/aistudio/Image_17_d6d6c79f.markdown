---
name: Obsidian Telemetry
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c2c6d7'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#8c90a0'
  outline-variant: '#424655'
  surface-tint: '#b0c6ff'
  primary: '#b0c6ff'
  on-primary: '#002d6e'
  primary-container: '#558dff'
  on-primary-container: '#002661'
  inverse-primary: '#0058ca'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#00e475'
  on-tertiary: '#003918'
  tertiary-container: '#00a754'
  on-tertiary-container: '#003114'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429b'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.03em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.75rem
  margin: 1rem
  margin-expanded: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an engineering-grade, high-precision mobile interface tailored for real-time network protocol exploration and telemetry monitoring. It synthesizes the mechanical rigor of network diagnostic consoles with the refined usability of modern consumer utility tools. 

Targeted at infrastructure engineers, security auditors, and technical operators, the visual aesthetic projects authority, cryptographic stability, and real-time responsiveness. The design movement is Corporate Modern anchored in Material Design 3, translated through deep obsidian tonal planes, calibrated luminescent status indicators, and hairline containment grids. Visual clutter is eliminated in favor of information density, high-contrast monospace readings, and systematic telemetry cues.

## Colors

The palette operates under a strict dark-mode-first paradigm, calibrated to reduce eye strain during continuous telemetry monitoring while maximizing diagnostic clarity.

### Functional Roles
- **Primary (`#2979FF`):** Technical Blue anchors primary interactive elements, tab selections, active connection states, and structural system focus.
- **Secondary (`#00E5FF`):** Electric Cyan serves as the active signal indicator, highlighting telemetry sweeps, radar indicators, scan pings, and real-time bandwidth meters.
- **Tertiary (`#00E676`):** Status Emerald indicates verified cryptographic handshakes, sub-50ms latency nodes, and normal protocol operation.
- **Warning Amber (`#FFAB00`):** Indicates degraded performance, server load exceeding threshold limits, or unstable packet transport.
- **Critical Crimson (`#FF1744`):** Flags dropped handshakes, dead routes, cipher mismatches, and failed authentication.

### Surface Architecture
- **Canvas Base:** `#080C14`
- **Surface Container (Lowest):** `#0D1321`
- **Surface Container (Default):** `#0F172A`
- **Surface Container (High):** `#1E293B`
- **Hairline Borders:** `rgba(255, 255, 255, 0.08)` and `#334155`

### Text & Contrast Ratios
- **Text High-Emphasis:** `#F8FAFC` (used for telemetry metrics, primary server names, and critical statuses)
- **Text Medium-Emphasis:** `#94A3B8` (used for column headers, secondary timestamps, and node descriptions)
- **Text Disabled / Tertiary:** `#64748B` (used for dormant labels, inactive ports, and subtle metadata)

## Typography

Typography balances rapid scanning ergonomics with high data density. `Inter` provides structural neutrality across all native Android UI layers, ensuring clean horizontal tracking and legibility on mobile viewports.

### Application Rules
- **Numerical Data & Network Identifiers:** Tabular figures must be enabled (`font-feature-settings: "tnum"`) across all latency metrics, IP readouts, cipher suites, and byte counters to prevent jitter during live data feeds.
- **Status Identifiers:** Use `label-sm` or `label-md` styled with uppercase transformations and slight positive tracking (`letterSpacing: 0.05em`) to differentiate state tags from natural body copy.
- **Hierarchy Enforcers:** Restrict `headline-lg` strictly to primary view summits and top-tier metrics. Use `title-md` and `title-sm` for modular cards and server list groupings.

## Layout & Spacing

The layout operates on an 8pt architectural grid with 4pt micro-adjustments for telemetry indicators and density-critical tables.

### Layout Geometry
- **Mobile Grid:** 4-column fluid layout with `1rem` outer canvas margin and `1rem` gutter. 
- **Telemetry Cards:** Cards use internal structural padding of `space-md` (`1rem`) on horizontal and vertical planes, stepping down to `space-sm` (`0.5rem`) for compact telemetry sub-panels.
- **Reflow Rules:** Single-column stacked cards on phone screens (<600dp); automatically expands to 2-column or 3-column synchronized panels on foldable and tablet layouts (>600dp) to compare simultaneous connection streams side-by-side.

## Elevation & Depth

Visual hierarchy is maintained through Material Design 3 surface containers, selective tonal illumination, and ultra-fine mechanical outlines rather than heavy drop shadows.

### Surface Container Tiers
- **Tier 0 (Root Canvas):** `#080C14` — Base foundation of the application viewport.
- **Tier 1 (Surface Lowest):** `#0D1321` — Recessed zones, inset data monitors, and track backgrounds.
- **Tier 2 (Surface Default):** `#0F172A` with border `1px solid rgba(255, 255, 255, 0.08)` — Standard diagnostic card containers and list rows.
- **Tier 3 (Surface High):** `#1E293B` with border `1px solid rgba(255, 255, 255, 0.12)` — Elevated modals, bottom sheets, context dropdowns, and active probe panels.

### Lighting & Shadow Rules
Shadows are subtle and low-opacity, tinted with deep sapphire:
- **Card Depth:** `0px 2px 4px rgba(2, 6, 23, 0.4), 0px 8px 16px rgba(2, 6, 23, 0.2)`
- **Active Scanning Halo:** When a node or action is actively tracing, apply a focused ambient glow: `0px 0px 12px rgba(41, 121, 255, 0.35)` or `0px 0px 12px rgba(0, 229, 255, 0.25)`.

## Shapes

The design uses roundedness level `2`, providing structured, modern geometric corners that preserve a technical, disciplined character without visual harshness.

### Radius Scale
- **Base Components (`rounded` / 0.5rem):** Standard action buttons, input fields, filter chips, list rows, and segmented control chips.
- **Containers & Surfaces (`rounded-lg` / 1rem):** Diagnostic cards, latency trend panels, bottom sheets, and modal frames.
- **Floating Controls (`rounded-xl` / 1.5rem):** Floating action buttons (FAB), global status pods, and search anchor pills.
- **Telemetry Indicators (Full Pill / 9999px):** Node status dots, packet status indicators, and handshake state badges.

## Components

### Buttons & Action Triggers
- **Primary Action (Scan / Connect):** High-contrast filled button in `#2979FF` with `#F8FAFC` label, minimum height 48dp, corner radius 8dp (`0.5rem`). Pressed state transitions to active glow with `#00E5FF` edge illumination.
- **Secondary Action (Configure / Export):** Surface `#1E293B` background with a `1px` stroke in `rgba(255, 255, 255, 0.12)` and `#F8FAFC` text.
- **Tertiary Action (Ghost / Reset):** Transparent background with `#94A3B8` text, hover/press state using `rgba(41, 121, 255, 0.12)`.

### Telemetry & Server Cards
- Built using Tier 2 Surface (`#0F172A`) with a fine border (`1px solid rgba(255,255,255,0.08)`).
- Header row hosts country flag/cluster ID (`title-sm`), followed by inline status pill and ping meter (`label-md`).
- Body section contains tabular key-value rows: Gateway IP, Handshake duration, Packet Drop %, and Active Cipher.
- Expandable sub-drawer reveals raw IKEv2 payload logs with dark inset styling (`#080C14`).

### Chips & Filter Pills
- **State Filter Chips:** Height 32dp, radius 8dp, surface `#0F172A`, border `1px solid rgba(255, 255, 255, 0.08)`.
- **Selected State:** Border color switches to `#2979FF` with an internal tint of `rgba(41, 121, 255, 0.15)`. Text changes from `#94A3B8` to `#F8FAFC`.
- **Status Pills:** Compact height (20dp), containing a 6dp circular status dot (Emerald `#00E676`, Amber `#FFAB00`, or Crimson `#FF1744`) alongside a bold metric tag (`label-sm`).

### Checkboxes, Radios, and Toggles
- **Toggles:** Track width 52dp, height 32dp. Inactive track: `#1E293B` with thumb `#64748B`. Active track: `#2979FF` with thumb `#F8FAFC`.
- **Checkboxes & Radios:** Hairline borders `#334155`. Checked state filled with `#2979FF`, rendering a crisp white check/inner circle.

### Input & Query Fields
- **Search & Filter Inputs:** Height 48dp, surface `#0D1321`, border `1px solid #334155`, corner radius 8dp. 
- Leading icon tinted `#94A3B8`. Focused state drives border to `#00E5FF` with a subtle focus ring (`0 0 0 1px #00E5FF`). Placeholder text in `#64748B`.

### Mobile Navigation & Floating Actions
- **Bottom Navigation Bar:** Height 64dp, surface `#080C14` with a top boundary of `1px solid rgba(255, 255, 255, 0.08)`. Active navigation items display an Electric Cyan indicator pill behind the icon, labeled with `label-md` in `#F8FAFC`.
- **Floating Action Button (Diagnostics Probe):** Extended pill shape or 56dp square-round (`rounded-xl`), filled with `#2979FF`, presenting high-contrast network probe iconography.