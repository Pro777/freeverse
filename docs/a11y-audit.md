# Accessibility Audit

**Standard:** WCAG 2.1 AA
**Status:** Complete — Seton Sweep applied.

## Features Implemented

### Skip Navigation
- Skip-nav link added to `BaseLayout.astro` as first body child
- Target: `#main-content` on `<main>` element
- Visible on focus, hidden otherwise

### Poem Reader
- Poem lines (`<li>`) have `tabindex="0"` and `role="option"`
- `aria-selected` reflects selection state
- Keyboard: Enter/Space to select a line; Shift+Enter/Space to extend selection
- `aria-label="Stanza break"` on blank lines

### Theme Toggle
- `aria-pressed` attribute reflects current state (pressed = dark mode)
- All theme toggle buttons updated on state change

### Mobile Menu
- Focus trap: Tab/Shift+Tab cycles within open menu
- Escape key closes menu (existing)
- `aria-expanded`, `aria-controls`, `aria-haspopup` all present

### Search
- Input has visible `<label>` (`.sr-only`)
- Results list has `aria-live="polite"` and `aria-label="Search results"`
- Keyboard nav: ArrowDown from input focuses first result; ArrowUp/Down within results; ArrowUp on first result returns to input

### Focus Styles
- Global `:focus-visible` with `--focus-ring` token
- `.sr-only` utility class for screen-reader-only content

## Contrast

All foreground/background combinations meet 4.5:1 minimum. See `docs/design-audit.md`.
