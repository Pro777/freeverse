# Design System

Freeverse uses a warm-paper aesthetic with lamplit dark mode. This document is the design source of truth.

## Color Palette

### Light Mode (Warm Paper)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#fbf7ee` | Page background |
| `--bg2` | `#f3efe6` | Gradient terminus |
| `--paper` | `#fffdf8` | Card / shell surface |
| `--ink` | `#1b1a16` | Primary text |
| `--muted` | `#5b5750` | Secondary text |
| `--border` | `rgba(27,26,22,0.14)` | Dividers |
| `--accent` | `#8a6a12` | Brand / interactive |
| `--accent-ink` | `#fffdf8` | Text on accent |

### Dark Mode (Lamplit)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#0b0a08` | Page background |
| `--paper` | `#14110c` | Card / shell surface |
| `--ink` | `#f2eee5` | Primary text |
| `--muted` | `#c0b7a8` | Secondary text |
| `--accent` | `#d7b35a` | Brand / interactive (lightened for contrast) |

## Typography

| Token | Value | Usage |
|---|---|---|
| `--serif` | Georgia stack | Body, headings, poem text |
| `--sans` | System UI stack | UI labels, nav, meta |
| `--mono` | SFMono stack | Code |

## Spacing

| Token | Value |
|---|---|
| `--space-xs` | `0.35rem` |
| `--space-sm` | `0.65rem` |
| `--space-md` | `1rem` |
| `--space-lg` | `1.5rem` |
| `--space-xl` | `2.75rem` |

## Layout

| Token | Value | Usage |
|---|---|---|
| `--measure` | `60rem` | Container max-width |
| `--measure-reader` | `44rem` | Poetry reader width |
| `--grid-min` | `18rem` | Grid column minimum |

## Radii

| Token | Value |
|---|---|
| `--radius` | `16px` |
| `--radius-sm` | `12px` |
| `--radius-pill` | `999px` |

## Brand

- Favicon: serif italic lowercase "f" in `--accent` color (`#8a6a12` light / `#d7b35a` dark)
- Site name: "Freeverse" in serif
- Tagline: "Public-domain poetry, pleasantly readable"
- Motto: *Non omnis moriar* (Horace)

## Focus Ring

`--focus-ring: 2px solid color-mix(in oklab, var(--accent) 60%, transparent)`

Applied globally via `:focus-visible`.
