# Design Audit — Freeverse Sweep (2026-03-04)

## 1. Accessibility (WCAG 2.1 AA)

### Completed

**Skip navigation**: Added `<a href="#main-content" class="skip-nav">Skip to content</a>` as first child of `<body>` in BaseLayout.astro. Styled to be invisible until focused, then slides in from top-left with accent background. Target `id="main-content"` added to `<main>`.

**Poem reader keyboard access**: Non-blank poem lines now have `role="button"`, `tabindex="0"`, and `aria-roledescription="selectable line"`. Enter and Space keys trigger the same selection behavior as click. Shift+Enter/Space extends a range. Each line has `aria-label="Line {n}"`, blank lines have `aria-label="Stanza break"`.

**Theme toggle**: Both desktop and mobile theme toggle buttons now have `aria-pressed` attribute, dynamically updated when theme cycles. `aria-pressed="false"` when on system default, `"true"` when an explicit theme is active.

**Mobile menu focus trap**: When the mobile menu opens, focus moves to the first nav link. Tab cycles within the menu (wraps at boundaries). Escape closes the menu and returns focus to the menu button. The `lastFocusedElement` pattern preserves return-focus on close.

**Mobile nav label**: Changed from duplicate `aria-label="Primary"` to `aria-label="Primary navigation (mobile)"` to differentiate from the desktop nav.

**Search keyboard navigation**: Search results now have `role="listbox"` on the container and `role="option"` on each result item. Arrow Down from the search input moves focus into results; Arrow Up from the first result returns to the input. Enter navigates to the focused result. Count element has `aria-live="polite"` and `aria-atomic="true"` for screen reader announcements.

**Focus-visible styles**: Added global `:focus-visible` rules for links, buttons, inputs, poem lines, and search results. Uses `var(--focus-ring)` token for consistent accent-colored 2px outline.

### Color contrast audit

All 14 color combinations tested (7 light, 7 dark) pass WCAG AA for normal text (4.5:1 minimum).

| Combination | Light ratio | Dark ratio |
|---|---|---|
| Primary text on bg | 16.3:1 | 17.1:1 |
| Primary text on card | 17.1:1 | 16.3:1 |
| Muted text on bg | 6.7:1 | 10.0:1 |
| Muted text on card | 7.1:1 | 9.5:1 |
| Accent on card | 5.0:1 | 9.4:1 |
| Accent on bg | 4.7:1 | 9.9:1 |
| Text on accent button | 5.0:1 | 9.4:1 |

Note: Light-theme accent on bg (4.7:1) has minimal margin above 4.5:1. If the accent color shifts, re-check this ratio.

### Remaining items

- Screen reader testing with VoiceOver/NVDA on actual poem content (stanza flow, line announcement order)
- `prefers-reduced-motion` coverage is present for toast; could extend to skip-nav slide transition
- Browse page (302 items) may benefit from virtual scrolling or pagination for assistive tech performance

---

## 2. Design Tokens

### Completed

Extracted the following token categories into `:root`:

**Typography**: `--text-xs` through `--text-xl`, `--line-height-tight/normal/relaxed/poetry`. Existing `clamp()` values for headings retained as-is.

**Spacing**: `--space-xs` through `--space-4xl` on a simple rem scale.

**Layout**: `--measure` (60rem container), `--measure-reader` (44rem poem), `--grid-min` (18rem). Applied to `.container`, `.reader`, `.grid`.

**Border & radius**: `--radius-pill` (999px) added alongside existing `--radius` and `--radius-sm`.

**Interactive**: `--focus-ring`, `--focus-offset`, `--transition-fast`.

### Token application

Key replacements made: `.container max-width`, `.reader max-width`, `.grid minmax()`. Remaining magic numbers (padding, margin, gap values) are documented in the token mapping but left in place to avoid a large diff — they can be migrated incrementally.

### Remaining items

- Replace remaining inline spacing magic numbers with `--space-*` tokens (incremental, low risk)
- Replace inline `font-size` values with `--text-*` tokens
- Consider responsive breakpoint tokens (`--bp-mobile: 520px`, `--bp-tablet: 820px`)
- Inline styles on .astro components (e.g., `style="margin: 0.35rem"`) should migrate to CSS classes over time

---

## 3. Brand Consistency

### Current state

- Favicon: BaseLayout already references `favicon.svg` and `favicon.ico` — files need to exist in `public/`
- OG image: Referenced as `og.png` — exists but quality/dimensions unverified
- Color palette: Formally documented now via the contrast audit; warm paper (light) / lamplit (dark) themes are cohesive
- UI copy voice: Minimal and calm, consistent with the "poetry should feel like a page" principle from ROADMAP.md

### Remaining items

- Generate an SVG favicon (quill, book, or typographic "F" in the accent gold)
- Verify og.png dimensions (recommended: 1200×630) and visual quality
- Formalize the color palette as a brand reference (the light/dark token blocks serve this purpose for now)
- Footer copy is clean; consider adding a one-line tagline or version
- The two different descriptions ("Public-domain poetry, pleasantly readable" in header vs. "Public-domain poetry. A clean reader. Shareable line links." on homepage) could be unified

---

## 4. Summary of files changed

| File | Changes |
|---|---|
| `global.css` | Design tokens in `:root`, token references in layout, skip-nav styles, focus-visible styles, search result focus |
| `BaseLayout.astro` | Skip-nav link, `id="main-content"` on `<main>` |
| `SiteHeader.astro` | `aria-pressed` on theme toggles, mobile nav label, focus trap + focus management in mobile menu |
| `page-poem.astro` | `role="button"`, `tabindex`, `aria-label`, `aria-roledescription` on lines; Enter/Space keyboard handler |
| `page-search.astro` | `aria-live` on count, `role="listbox/option"` on results, arrow key + Enter keyboard navigation |
| `design-audit.md` | This document |
