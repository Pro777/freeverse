# Freeverse Roadmap

This document captures **local design decisions** made while iterating on the “reader” experience.

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

## Local testing checklist
- `npm run dev` in `site/`:
  - Visit a poem and confirm stanza breaks are visually clear.
  - Click a line to copy/share the URL fragment; verify selection highlight still works.
  - Shift-click to select a range.
  - Test on narrow viewport (responsive gutter).
- `npm run build` in `site/`:
  - Ensure Astro builds without warnings/errors.
