# Freeverse Roadmap

This document captures design decisions plus a small set of next shippable steps.

## Principles
- Never expose internal implementation details in user-facing copy (e.g. don’t mention `meta/*.yml`).
- Poetry should feel like a page: calm typography, low chrome, stable links.

## Readability-first reader (poem page)

### Decisions (2026-02-02)
- **Poem text should feel like a page, not a widget.**
  - Removed the bordered/rounded "card" container around poem lines.
  - Removed hover styling that made the poem feel like an interactive list.
- **Stanzas are separated by whitespace, not rules.**
  - Blank lines are rendered as normal lines but styled with extra vertical padding (`.is-blank`) to create stanza separation.
- **Typography tuned for reading poetry:**
  - Slightly larger default size via `clamp(...)`.
  - Increased line-height for breathing room.
  - Slight letter-spacing to reduce visual crowding.
- **Sharing/selection stays, but is visually quieter.**
  - Selection highlight uses a subtle background wash plus a left rule.

### Open questions
- Should blank lines be **non-shareable** (no hash target / no click) or keep them shareable for consistent line indexing?
- Should we add an optional **“show line numbers”** toggle for citation while keeping the default view clean?
- Consider a more “book-like” mode:
  - Larger top/bottom margins
  - Optional centered title page styling

## Killer feature: shareable line ranges (wedge vs Poetry Foundation)
Make “read and point” frictionless.

### Next shippable improvements (focus)
- [ ] **Share toast quality**: “Copied link to lines 12–17” (not just “Link copied”).
- [ ] **Deep-link polish**: on load of `#lA-lB`, auto-scroll selection to ~30% from top.
- [ ] **Copy button (optional)**: show a small “Copy link” button when a range is selected.
- [ ] **Discoverability**: subtle gutter affordance on hover/focus; keep default view calm.

## Next 3 general features (low complexity / high value)
- [ ] **Author pages**: `/author/<slug>/` listing poems by author; make author names clickable.
- [ ] **Search on Browse**: title/author substring filter (client-side).
- [ ] **Favorites**: star poems with `localStorage` (no backend).

## Onboarding copy
- [ ] Keep the hint, but make it smaller and contextual: “Click a line to link · shift‑click for a range.”

## Local testing checklist
- `npm run dev` in `site/`:
  - Visit a poem and confirm stanza breaks are visually clear.
  - Click a line to copy/share the URL fragment; verify selection highlight still works.
  - Shift-click to select a range.
  - Test on narrow viewport (responsive gutter).
- `npm run build` in `site/`:
  - Ensure Astro builds without warnings/errors.

## Ideas / next
- Search: add keyboard navigation + highlight matches; consider excerpt/first-line search once meta index exists.
- Author pages: /author/<slug> with bio + poem list (link from byline).
- Gutenberg ingest: Shakespeare sonnets first; US-PD provenance + dedupe variants.
