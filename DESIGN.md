# KGarden IT Asset — DESIGN.md

> Inspired by [Linear](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/linear.app) from VoltAgent/awesome-design-md:
> product-craft density, hairline borders, single chromatic accent, measured typography.
> Adapted for a light-mode internal ops tool (Thai office IT) with a garden-teal brand accent — not Linear purple.

## Visual Theme & Atmosphere

Precision ops console for IT Support. Quiet, technical, trustworthy. Surfaces read as paper panels on a cool gray canvas. One accent color (garden teal) for primary actions and focus — never decorative gradients. Dense tables and forms; generous whitespace only on employee-facing report pages.

## Color Palette & Roles

| Token | Hex | Role |
|---|---|---|
| canvas | `#F4F5F7` | App background |
| surface | `#FFFFFF` | Cards, tables, forms |
| surface-muted | `#EEF0F3` | Hover rows, secondary chips |
| ink | `#0B0D10` | Primary text |
| ink-muted | `#5C6570` | Secondary text |
| ink-subtle | `#8B939E` | Captions, placeholders |
| hairline | `#E2E5EA` | Borders |
| hairline-strong | `#C8CED6` | Input borders, dividers |
| accent | `#0F6B5C` | Primary CTA, focus, brand |
| accent-hover | `#0C5649` | CTA hover |
| accent-soft | `#E6F4F1` | Soft accent backgrounds |
| sidebar | `#0B0D10` | Admin sidebar canvas |
| sidebar-ink | `#F4F5F7` | Sidebar text |
| sidebar-muted | `#8B939E` | Sidebar secondary |
| success | `#1B7F4A` | Active / done |
| warning | `#B45309` | Pending / aging |
| danger | `#B42318` | Error / urgent |
| info | `#1D4ED8` | Informational |

## Typography

- **UI / Display:** `DM Sans` — headings 600, tight tracking (−0.02em)
- **Body / Thai:** `Noto Sans Thai` — readable Thai + Latin fallback
- **Mono / codes:** `IBM Plex Mono` — asset codes, case IDs

Scale: page title 22–24px / section 16–18px / body 14px / caption 12px / micro 11px

## Component Stylings

- **Primary button:** accent fill, white text, radius 8px, padding 8×14, weight 500
- **Secondary button:** white surface, hairline border, ink text
- **Danger button:** white + danger border/text
- **Inputs:** white, hairline-strong border, focus ring accent 2px soft
- **Cards:** white, hairline border, radius 12px, no heavy shadow (optional 0 1px 2px rgba(11,13,16,0.04))
- **Badges:** soft tint background + matching ink, radius pill, 11–12px
- **Sidebar nav:** dark ink canvas; active item accent-soft text on subtle white/5 overlay
- **Tables:** hairline row dividers, muted header, hover surface-muted

## Layout Principles

- Admin: fixed 240px sidebar + fluid main (padding 24–32px)
- Employee report: centered max-width 720px, calm canvas
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48
- One job per section; avoid stacked card chrome

## Depth & Elevation

Prefer borders over shadows. Elevation only on floating menus/modals.
No glow, no multi-layer shadows, no gradient backgrounds.

## Do's and Don'ts

**Do:** hairline panels, single teal accent, monospace asset codes, quiet empty states  
**Don't:** purple/indigo gradients, emoji-heavy nav, rounded-full pill CTAs everywhere, cream+terracotta, heavy card stacks

## Agent Prompt Guide

When editing UI: use tokens from `globals.css` (`bg-canvas`, `bg-surface`, `text-ink`, `border-hairline`, `bg-accent`, `.btn`, `.btn-primary`, `.card`, `.input`, `.label`). Keep Thai copy plain and action-oriented.
