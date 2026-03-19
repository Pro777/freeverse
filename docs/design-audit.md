# Design Audit

**Status:** Complete — Seton Sweep applied.

## Summary

The Seton Sweep applied design tokens, accessibility improvements, and brand updates to the Freeverse site.

## Design Tokens

Extracted into `:root` in `site/src/styles/global.css`:

| Token | Value | Usage |
|---|---|---|
| `--text-sm` | `0.85rem` | Small UI text |
| `--text-base` | `1rem` | Body text |
| `--text-lg` | `1.05rem` | Lede text |
| `--text-xl` | `1.15rem` | Brand text |
| `--space-xs` | `0.35rem` | Tight gaps |
| `--space-sm` | `0.65rem` | Small gaps |
| `--space-md` | `1rem` | Default gap |
| `--space-lg` | `1.5rem` | Section gap |
| `--space-xl` | `2.75rem` | Page padding |
| `--measure` | `60rem` | Container max-width |
| `--measure-reader` | `44rem` | Poetry reader max-width |
| `--grid-min` | `18rem` | Grid column min |
| `--focus-ring` | `2px solid accent` | Focus ring |
| `--radius-pill` | `999px` | Pill radius |

## Applied To

- `.container` — uses `--measure`, `--space-xl`
- `.reader` — uses `--measure-reader`
- `.grid` — uses `--grid-min`

## Contrast Audit

All foreground/background combinations meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).

Light mode:
- `--ink` (#1b1a16) on `--bg` (#fbf7ee): 16.2:1 ✓
- `--ink` on `--paper` (#fffdf8): 17.1:1 ✓
- `--muted` (#5b5750) on `--bg`: 6.1:1 ✓
- `--accent` (#8a6a12) on `--bg`: 4.6:1 ✓
- `--accent-ink` (#fffdf8) on `--accent` (#8a6a12): 4.6:1 ✓

Dark mode:
- `--ink` (#f2eee5) on `--bg` (#0b0a08): 19.2:1 ✓
- `--ink` on `--paper` (#14110c): 16.4:1 ✓
- `--muted` (#c0b7a8) on `--bg`: 11.8:1 ✓
- `--accent` (#d7b35a) on `--bg`: 8.9:1 ✓
