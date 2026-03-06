# Freeverse Design System

Comprehensive reference for the Freeverse poetry site design tokens, component patterns, and accessibility conventions.

---

## 1. Design Tokens

All design tokens are defined in `:root` of `global.css` and are organized by category for maintainability and consistency.

### 1.1 Typography

**Font Stacks** (defined as CSS custom properties):

| Token | Font Stack |
|---|---|
| `--serif` | `ui-serif`, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", Times, serif |
| `--sans` | `ui-sans-serif`, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji" |
| `--mono` | `ui-monospace`, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace |

**Purpose**: Serif for body text and poetry (readability and elegance); Sans for UI elements and metadata; Mono for code blocks.

**Type Scale** (rem-based, representing actual font sizes):

| Token | Size | Usage |
|---|---|---|
| `--text-xs` | 0.78rem | Small labels, metadata, tags |
| `--text-sm` | 0.85rem | Smaller text, subtitles |
| `--text-base` | 0.9rem | Base body text |
| `--text-md` | 0.92rem | UI text (nav, buttons) |
| `--text-lg` | 1.05rem | Large text, leads |
| `--text-xl` | 1.15rem | Brand title, emphasis |

**Line Height Scale**:

| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | 1.15 | Headings, compact labels |
| `--line-height-normal` | 1.7 | Standard prose/body text |
| `--line-height-relaxed` | 1.75 | Readable body text |
| `--line-height-poetry` | 1.95 | Poetry lines (extra breathing room) |

**Responsive Headings** (using `clamp()` for fluid scaling):

- `h1`: `clamp(2.25rem, 1.75rem + 2vw, 3rem)` — Page titles
- `h2`: `1.1rem` with `letter-spacing: 0.09em` and `text-transform: uppercase` — Section headers (UI)
- `.reader-title`: `clamp(2.05rem, 1.65rem + 1.7vw, 2.75rem)` — Poem titles
- `.line-text`: `clamp(1.05rem, 1.01rem + 0.35vw, 1.18rem)` — Poetry lines

### 1.2 Color Palette

Colors are theme-aware and respond to both system preference and explicit user selection via `data-theme` attribute.

#### Light Theme
Applied by default or when `data-theme="light"`:

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#fbf7ee` | Page background (base) |
| `--bg2` | `#f3efe6` | Secondary background (gradients) |
| `--paper` | `#fffdf8` | Card backgrounds, shell interior |
| `--ink` | `#1b1a16` | Primary text color (16.3:1 contrast on bg) |
| `--muted` | `#5b5750` | Secondary text, metadata (6.7:1 contrast on bg) |
| `--border` | `rgba(27, 26, 22, 0.14)` | Subtle borders and dividers |
| `--accent` | `#8a6a12` | Gold accent, buttons, highlights (WCAG AA: 4.7:1 on bg) |
| `--accent-ink` | `#fffdf8` | Text on accent backgrounds (5.0:1 contrast) |

**Component-specific colors (light)**:

| Token | Value | Purpose |
|---|---|---|
| `--shell-bg` | `rgba(255, 253, 248, 0.72)` | Main container with transparency for backdrop blur |
| `--header-bg` | `rgba(255, 253, 248, 0.82)` | Header with enhanced opacity |
| `--footer-bg` | `rgba(255, 253, 248, 0.72)` | Footer background |
| `--card-bg` | `var(--paper)` | Card backgrounds (white) |
| `--card-border` | `rgba(27, 26, 22, 0.12)` | Card subtle borders |
| `--pill-bg` | `rgba(255, 248, 228, 0.9)` | Metadata pill badges (warm cream) |
| `--preview-bg` | `rgba(255, 248, 228, 0.55)` | Poetry preview blocks (light golden) |

#### Dark Theme
Applied when `data-theme="dark"` or system prefers dark mode (`@media (prefers-color-scheme: dark)`):

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0b0a08` | Page background (lamplit) |
| `--bg2` | `#12100c` | Secondary background |
| `--paper` | `#14110c` | Card backgrounds (deep dark) |
| `--ink` | `#f2eee5` | Primary text color (17.1:1 contrast on bg) |
| `--muted` | `#c0b7a8` | Secondary text (10.0:1 contrast on bg) |
| `--border` | `rgba(242, 238, 229, 0.14)` | Subtle light borders |
| `--accent` | `#d7b35a` | Brighter gold for dark (9.4:1 contrast on card) |
| `--accent-ink` | `#14110c` | Text on accent (9.4:1 contrast) |

**Component-specific colors (dark)**:

| Token | Value |
|---|---|
| `--shell-bg` | `rgba(20, 17, 12, 0.78)` |
| `--header-bg` | `rgba(20, 17, 12, 0.84)` |
| `--footer-bg` | `rgba(20, 17, 12, 0.78)` |
| `--card-bg` | `rgba(20, 17, 12, 0.92)` |
| `--card-border` | `rgba(242, 238, 229, 0.14)` |
| `--pill-bg` | `rgba(36, 31, 22, 0.96)` |
| `--preview-bg` | `rgba(36, 31, 22, 0.62)` |
| `--shadow` | `0 1px 0 rgba(0, 0, 0, 0.30), 0 24px 70px rgba(0, 0, 0, 0.44)` |

#### Contrast Ratios (WCAG 2.1 AA Compliance)

All combinations tested and certified as passing minimum 4.5:1 ratio for normal text:

| Combination | Light | Dark |
|---|---|---|
| Primary text on background | 16.3:1 | 17.1:1 |
| Primary text on card | 17.1:1 | 16.3:1 |
| Muted text on background | 6.7:1 | 10.0:1 |
| Muted text on card | 7.1:1 | 9.5:1 |
| Accent on card | 5.0:1 | 9.4:1 |
| Accent on background | 4.7:1 | 9.9:1 |
| Text on accent button | 5.0:1 | 9.4:1 |

### 1.3 Spacing Scale

Consistent rem-based scale for margin, padding, and gaps:

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 0.25rem | Micro spacing (4px) |
| `--space-sm` | 0.5rem | Small gaps |
| `--space-md` | 0.75rem | Medium spacing |
| `--space-lg` | 1rem | Standard spacing |
| `--space-xl` | 1.25rem | Large spacing |
| `--space-2xl` | 1.5rem | Extra large |
| `--space-3xl` | 2rem | 2X spacing |
| `--space-4xl` | 3rem | 3X spacing |

*Note*: Many inline padding/margin values remain un-tokenized (e.g., `padding: 0.6rem`, `margin: 0.35rem`). These can be migrated incrementally to tokens.

### 1.4 Border & Radius

| Token | Value | Usage |
|---|---|---|
| `--radius` | 16px | Default rounded corners (cards, inputs) |
| `--radius-sm` | 12px | Smaller radius (preview blocks) |
| `--radius-pill` | 999px | Fully rounded (buttons, badges) |

### 1.5 Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow` | Light: `0 1px 0 rgba(2, 6, 23, 0.05), 0 14px 30px rgba(2, 6, 23, 0.10)` | Subtle depth (light theme) |
| `--shadow` | Dark: `0 1px 0 rgba(0, 0, 0, 0.30), 0 24px 70px rgba(0, 0, 0, 0.44)` | Enhanced depth (dark theme) |

Used on: cards, shell (container), mobile menu, toast notifications.

### 1.6 Layout

| Token | Value | Usage |
|---|---|---|
| `--measure` | 60rem (960px) | Default container max-width (content) |
| `--measure-reader` | 44rem (704px) | Narrow measure for poetry reading (better focus) |
| `--grid-min` | 18rem (288px) | Minimum card width in responsive grid |

### 1.7 Interactive

| Token | Value | Usage |
|---|---|---|
| `--focus-ring` | `2px solid var(--accent, #8a6a12)` | Focus indicator for keyboard navigation |
| `--focus-offset` | 3px | Space between element and focus outline |
| `--transition-fast` | 140ms ease | Standard animation timing (mobile menu, toast, theme toggle) |

---

## 2. Color System

### Light Theme Palette (Warm Paper)

A warm, off-white aesthetic designed for comfortable long-form reading:

```
Background:  #fbf7ee (warm beige)
Paper:       #fffdf8 (near-white cream)
Ink:         #1b1a16 (deep warm brown)
Muted:       #5b5750 (soft tan)
Accent:      #8a6a12 (muted gold/ochre)
Border:      rgba(27, 26, 22, 0.14) (subtle brown at 14% opacity)
```

### Dark Theme Palette (Lamplit)

A warm dark aesthetic inspired by reading by lamplight:

```
Background:  #0b0a08 (nearly black, slightly warm)
Paper:       #14110c (very dark brown)
Ink:         #f2eee5 (warm off-white)
Muted:       #c0b7a8 (warm beige/tan)
Accent:      #d7b35a (brighter gold)
Border:      rgba(242, 238, 229, 0.14) (subtle light at 14% opacity)
```

### Semantic Color Mapping

Colors are used semantically throughout the system:

- **Text Hierarchy**: `--ink` for primary, `--muted` for secondary
- **Interactive Elements**: `--accent` for buttons, links, highlights
- **Backgrounds**: `--bg` for body, `--paper` for containers
- **Surfaces**: `--shell-bg`, `--header-bg`, `--footer-bg`, `--card-bg` for component-level backgrounds
- **Metadata**: `--pill-bg` for tags and badges
- **Poetry Display**: `--preview-bg` for stanza previews
- **Subtle Dividers**: `--border` for 1px rules and card borders

---

## 3. Typography

### Font Stack Hierarchy

1. **Serif** (`--serif`) — Body text, poetry, long-form content
   - Default for `body`, `p`, `.poem-preview`, `.line-text`
   - Ensures poetry reads as a published text, not a widget

2. **Sans** (`--sans`) — UI text, labels, navigation
   - Used for: nav items, theme toggle, buttons, metadata, `.muted` text, headers (h2)
   - Provides UI clarity and scannability

3. **Mono** (`--mono`) — Code blocks (rare in current design)
   - Available for future code snippets or technical elements

### Type Scale Application

**Headings**:
- Page `h1`: Clamp function for fluid scaling
- Section `h2`: Small caps, uppercase, sans-serif (UI accent)
- Poem title (`.reader-title`): Large clamp for flexible heading sizing

**Body Text**:
- Standard prose: `var(--serif)`, `--text-base` (0.9rem), `--line-height-normal` (1.7)
- Poetry lines: `var(--serif)`, `clamp(1.05rem, 1.01rem + 0.35vw, 1.18rem)`, `--line-height-poetry` (1.95)
- Metadata/labels: `var(--sans)`, `--text-xs` or `--text-sm`

**Line Height Context**:
- Tight (1.15): For headings and compact UI
- Normal (1.7): For standard prose
- Relaxed (1.75): For longer blocks of text
- Poetry (1.95): For poetry lines (extra breathing room)

### Special Type Styles

**`.brand-title`**: 1.15rem, serif, bold, letter-spacing -0.015em

**`.brand-subtitle`**: 0.85rem, sans, muted color

**`.brand-motto`**: 0.92rem, serif, italic, slightly less muted

**`.lede`**: Large intro text; sans-serif, muted, used for subheadings on main pages

---

## 4. Component Inventory

This section documents reusable patterns found across `.astro` files, their CSS classes, variants, and states.

### 4.1 Shell

**Class**: `.shell`
**Used in**: `BaseLayout.astro` (wraps entire page content)

```css
.shell {
  background: var(--shell-bg);
  border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  border-radius: calc(var(--radius) + 6px);
  box-shadow: 0 30px 80px color-mix(in oklab, var(--ink) 14%, transparent);
  backdrop-filter: blur(10px);
  overflow: clip;
}
```

**Purpose**: Outer container with semi-transparent background, subtle border, and backdrop blur for depth. Responds to theme.

**States**:
- Responsive: Border radius adjusts from 22px (desktop/tablet) to 18px (mobile, ≤520px)

### 4.2 Header

**Class**: `.header`
**Used in**: `SiteHeader.astro` (top navigation bar)

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  background: linear-gradient(...) var(--header-bg);
}
```

**Purpose**: Main navigation area containing brand, nav links, and theme toggle.

**Subcomponents**:
- `.brand` — Logo/site title area
- `.brand-title` — "Freeverse" heading
- `.brand-subtitle` — Tagline (hidden on mobile ≤520px)
- `.brand-motto` — Italic Latin motto with link
- `.nav` — Desktop navigation links (hidden on mobile ≤520px)
- `.menu-toggle` — Hamburger button (visible only on mobile ≤520px)
- `.mobile-menu` — Popup menu with focus trap
- `.mobile-nav` — Mobile navigation list

**Responsive Behavior**:
- Desktop (>520px): Full nav + brand subtitle visible
- Mobile (≤520px): Menu toggle visible, nav hidden, subtitle hidden

### 4.3 Card

**Class**: `.card`
**Used in**: All pages (featured poem, explore, catalog, search, author pages)

```css
.card {
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
}
```

**Variants**:

1. **Standard Card** — Default styling, used for content blocks
2. **`.card-link`** — Positioned relative; allows nested interactive elements
   - `.featured-title:hover` — Underlines title
   - `.poem-preview-link:hover` — Changes preview border color

**States**:
- Default: Subtle shadow and border
- Hover (`.featured-title:hover`): Text underlines
- Hover (`.poem-preview-link:hover`): Preview border shifts to accent-tinted color

### 4.4 Grid

**Class**: `.grid`
**Used in**: Home page (featured + explore cards), browse page

```css
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min), 1fr));
  margin-top: 1.2rem;
}
```

**Purpose**: Responsive card layout that adapts to viewport width.

**Responsive**:
- Desktop/tablet: Auto-fit 2 columns (18rem minimum)
- Mobile (≤520px): Single column

### 4.5 List

**Class**: `.list`
**Used in**: Catalog, author lists, search results, action groups

```css
.list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
}

.list li {
  padding: 0.7rem 0;
  border-bottom: 1px dashed color-mix(in oklab, var(--border) 85%, transparent);
}

.list li:last-child {
  border-bottom: none;
}
```

**Subcomponents**:
- `.list-title` — Link within list item
  - `:hover` — Underlines
  - `:focus-visible` — Accent outline

**Purpose**: Clean, dashed-border list for poem titles, author names, search results.

### 4.6 List Title

**Class**: `.list-title`
**Used in**: `.list` items, browse/search/author pages

```css
.list-title {
  text-decoration: none;
}

.list-title:hover {
  text-decoration: underline;
}

.list-title:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Purpose**: Accessible link styling within lists (no underline by default, underlines on hover, focus-visible outline).

### 4.7 Pill

**Class**: `.pill`
**Used in**: Metadata badges (e.g., "Featured", "Daily delight", author counts)

```css
.pill {
  font-family: var(--sans);
  font-size: 0.78rem;
  color: var(--muted);
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--card-border);
  border-radius: 999px;
  background: var(--pill-bg);
}
```

**Purpose**: Small, pill-shaped badge for metadata.

### 4.8 Kicker

**Class**: `.kicker`
**Used in**: Card headers (title + pill together)

```css
.kicker {
  margin: 0 0 0.65rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
```

**Purpose**: Flex layout for section title (h2) and pill badge.

### 4.9 Poem Preview

**Class**: `.poem-preview`
**Used in**: Featured poem card, search results (preview of opening lines)

```css
.poem-preview {
  margin: 0.5rem 0 0.85rem;
  white-space: pre-wrap;
  font-family: var(--serif);
  line-height: 1.7;
  padding: 0.75rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--preview-bg);
  border: 1px solid var(--card-border);
}
```

**Purpose**: Displays opening stanza or excerpt in a subtle golden box.

**Responsive**: Padding reduces on mobile (≤520px).

### 4.10 Actions Bar

**Class**: `.actions`
**Used in**: Card footers (featured poem, explore, author pages)

```css
.actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
}

.action {
  font-family: var(--sans);
  text-decoration: none;
  padding: 0.5rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: color-mix(in oklab, var(--paper) 86%, transparent);
}

.action.primary {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}

.action.primary:hover {
  filter: brightness(1.04);
}
```

**Variants**:
1. **Secondary** (default) — Light background, subtle border
2. **Primary** (`.action.primary`) — Accent background, brighter text

### 4.11 Hero Section

**Class**: `.hero`
**Used in**: Page headers (home, browse, search, author pages)

```css
.hero {
  margin: 0 0 1.4rem;
}

h1 { /* Inside .hero */
  font-size: clamp(2.25rem, 1.75rem + 2vw, 3rem);
}

.lede { /* Subheading in .hero */
  margin: 0.6rem 0 0;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 1.05rem;
}
```

**Purpose**: Page introduction with large heading and descriptive subtext.

### 4.12 Reader

**Class**: `.reader`
**Used in**: `page-poem.astro` (poetry reading view)

```css
.reader {
  max-width: var(--measure-reader);
}

.reader-head {
  margin: 0.25rem 0 1.4rem;
}

.reader-title {
  margin: 0;
  font-size: clamp(2.05rem, 1.65rem + 1.7vw, 2.75rem);
  text-wrap: balance;
  hyphens: auto;
}

.reader-byline {
  margin: 0.55rem 0 0;
  font-family: var(--sans);
}
```

**Purpose**: Narrower, dedicated layout for reading poetry (44rem max-width vs. 60rem standard).

### 4.13 Poem Lines

**Class**: `.poem-lines`
**Used in**: `page-poem.astro` (actual poem display)

```css
.poem-lines {
  list-style: none;
  padding: 0;
  margin: 1.15rem 0 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.poem-lines li {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  gap: 0.65rem;
  padding: 0.22rem 0;
}

.poem-lines li:not(.is-blank) {
  cursor: pointer;
}

.poem-lines li.is-blank {
  padding: 0.65rem 0;
}

.poem-lines li:target,
.poem-lines li.is-selected {
  background: color-mix(in oklab, var(--accent) 10%, transparent);
}

.poem-lines li.is-selected {
  box-shadow: inset 3px 0 0 color-mix(in oklab, var(--accent) 70%, transparent);
}
```

**Subcomponents**:
- `.line-anchor` — Gutter area (1.5rem) for line numbers/spacing
- `.line-text` — Actual poem text with poetry line-height (1.95)

**States**:
- Default: Clickable lines, no background
- `:target` — Line linked via URL hash, light accent background
- `.is-selected` — Selected line or range, light accent background + left accent border
- `.is-blank` — Stanza break (empty line), no click behavior, extra padding

**ARIA Attributes**:
- Non-blank `<li>`: `role="button"`, `tabindex="0"`, `aria-roledescription="selectable line"`, `aria-label="Line N"`
- Blank `<li>`: `aria-label="Stanza break"`

**Responsive**:
- Mobile (≤480px): Gutter reduces from 1.5rem to 1.1rem, gap 0.65rem to 0.5rem

### 4.14 Muted Text

**Class**: `.muted`
**Used in**: Metadata, secondary information throughout

```css
.muted {
  color: var(--muted);
}
```

**Purpose**: De-emphasize secondary text (author names, dates, counts, descriptions).

### 4.15 Toast Notification

**Class**: `.toast`
**Used in**: `page-poem.astro` (copy-to-clipboard feedback)

```css
.toast {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%) translateY(10px);
  opacity: 0;
  pointer-events: none;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--border) 75%, transparent);
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 0.9rem;
  box-shadow: var(--shadow);
  transition: opacity 140ms ease, transform 140ms ease;
}

.toast.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

**ARIA**: `role="status"`, `aria-live="polite"`

**States**:
- Hidden: `opacity: 0`, `translateY(10px)` (below viewport)
- Visible: `.is-visible` — `opacity: 1`, `translateY(0)` (slides up)
- Auto-dismisses after 1200ms

### 4.16 Skip Navigation

**Class**: `.skip-nav`
**Used in**: `BaseLayout.astro` (first element of `<body>`)

```css
.skip-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  padding: var(--space-md) var(--space-lg);
  background: var(--accent);
  color: var(--accent-ink);
  text-decoration: none;
  border-radius: 0 0 var(--radius-sm) 0;
  font-family: var(--sans);
  font-size: var(--text-md);
  font-weight: 500;
  transform: translateY(-100%);
  transition: transform 200ms ease;
}

.skip-nav:focus {
  transform: translateY(0);
  outline: none;
}
```

**Purpose**: Hidden link that appears on focus for keyboard users to skip to main content (`#main-content`).

**Keyboard Access**: First Tab key press from page load reveals and focuses.

### 4.17 Search Input

**Class**: `.search` (inline in `page-search.astro`, not a dedicated CSS class)
**Used in**: `page-search.astro`

```html
<input
  id="q"
  type="search"
  placeholder="Search titles and authors…"
  style="flex: 1 1 18rem; padding: 0.6rem 0.75rem; border-radius: 12px; border: 1px solid var(--card-border); background: color-mix(in oklab, var(--paper) 92%, transparent); font-family: var(--sans); font-size: 1rem;"
/>
```

**States**:
- Default: Light background, card border, sans-serif
- `:focus-visible` — Accent focus ring (2px solid)

**ARIA**: Associated with search results `<ul role="listbox">`

### 4.18 Search Results

**Classes**: `#results[role="listbox"]`, `li[role="option"]`
**Used in**: `page-search.astro`

```css
#results [role="option"]:focus {
  outline: var(--focus-ring);
  outline-offset: -2px;
  background: color-mix(in oklab, var(--accent) 8%, transparent);
}
```

**ARIA**:
- Container: `role="listbox"`, `aria-label="Search results"`
- Items: `role="option"`, `tabindex="-1"` (controlled focus)
- Count badge: `aria-live="polite"`, `aria-atomic="true"`

**Keyboard Navigation**:
- From input: `ArrowDown` enters results
- Within results: `ArrowUp`/`ArrowDown` navigate, `ArrowUp` from first returns to input
- `Enter` navigates to focused result

---

## 5. Layout Patterns

### 5.1 Container

**Class**: `.container`
**Used in**: `BaseLayout.astro` (outermost wrapper)

```css
.container {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 2.75rem 1.25rem 4rem;
}

@media (max-width: 820px) {
  .container {
    padding: 1.5rem 0.85rem 3rem;
  }
}

@media (max-width: 520px) {
  .container {
    padding: 1.15rem 1rem 2.4rem;
  }
}
```

**Purpose**: Centers content, applies max-width, adds responsive top/bottom padding.

**Max-width**: 60rem (960px)

### 5.2 Reader Container

**Class**: `.reader`
**Used in**: Poem pages

```css
.reader {
  max-width: var(--measure-reader);
}
```

**Purpose**: Narrower container (44rem / 704px) for poetry reading to maintain focus and readability.

### 5.3 Main Content

**Element**: `<main id="main-content">`
**Used in**: `BaseLayout.astro`

```css
main {
  padding: 1.6rem 1.25rem 1.9rem;
}

@media (max-width: 820px) {
  main {
    padding: 1.25rem 0.95rem 1.5rem;
  }
}
```

**Purpose**: Page content area with responsive padding.

### 5.4 Footer

**Class**: `.footer`
**Used in**: `BaseLayout.astro`

```css
.footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  background: var(--footer-bg);
  color: var(--muted);
  font-family: var(--sans);
  font-size: 0.9rem;
}
```

**Purpose**: Page footer with attribution and links.

### 5.5 Responsive Breakpoints

**Breakpoints** (mobile-first approach):

| Breakpoint | Context | Changes |
|---|---|---|
| `520px` | Small mobile | Hide subtitle, show hamburger menu, single-column grid, reduce padding |
| `820px` | Tablet/medium | Adjust nav spacing, container padding, reduce font sizes slightly |

**Key Responsive Classes**:
- `.brand-subtitle` — `display: none` on mobile
- `.nav` — `display: none` on mobile
- `.menu-toggle` — `display: inline-flex` on mobile
- `.grid` — `grid-template-columns: 1fr` on mobile
- `.mobile-menu` — Positioned absolutely, appears on mobile only

---

## 6. Interaction Patterns

### 6.1 Theme Toggle

**Trigger**: Button `[data-theme-toggle]` (in both desktop `.nav` and mobile `.mobile-nav`)

**Cycle**: `system` → `light` → `dark` → `system`

**Mechanism**:
1. Reads from `localStorage` (key: `freeverse-theme`)
2. Sets `document.documentElement.dataset.theme` to `'light'` or `'dark'`
3. Falls back to system preference when `data-theme` is absent
4. Button text updates: "Theme: System", "Theme: Light", "Theme: Dark"

**ARIA**: `aria-pressed` attribute:
- `"false"` when system default
- `"true"` when explicit theme set

**CSS Application**:
- Light: `:root, :root[data-theme="light"] { --bg: #fbf7ee; ... }`
- Dark: `:root[data-theme="dark"] { ... }` and `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }`

### 6.2 Poem Line Selection

**Interaction**: Click or keyboard (Enter/Space) on poem lines

**Selection Behavior**:
- Single click: Selects one line, copies link to clipboard, shows toast
- Shift+click: Extends selection to a range, copies range link, shows toast

**URL Fragment Format**:
- Single line: `#l5` (line 5)
- Range: `#l5-l8` (lines 5 through 8)

**Visual Feedback**:
- Selected line: Light accent background + left accent border
- Unselected: Default
- Stanza breaks (blank lines): No selection, no background

**Keyboard Access** (`role="button"`, `tabindex="0"`):
- Tab to focus
- Enter or Space to select
- Shift+Enter/Space to extend range

**Toast Feedback**:
- "Copied link to line 5"
- "Copied link to lines 5-8"
- "Link ready (copy from address bar)" (fallback if Clipboard API unavailable)

**Mobile Behavior**: Same interaction; touch-friendly.

### 6.3 Mobile Menu

**Trigger**: `.menu-toggle` button (visible only on ≤520px)

**States**:
- Closed: `#mobile-menu[hidden]` (CSS `display: none`)
- Open: `#mobile-menu:not([hidden])` (CSS `display: block`)

**Behavior**:
1. Click menu button to toggle
2. Menu opens, focus moves to first link
3. Tab cycles within menu (focus trap)
4. Shift+Tab wraps backward
5. Escape key closes menu, focus returns to menu button
6. Clicking outside menu closes it
7. Clicking a nav link closes menu and navigates

**ARIA**:
- Button: `aria-haspopup="true"`, `aria-expanded="false|true"`, `aria-controls="mobile-menu"`
- Menu: `[hidden]` attribute, `.mobile-nav[aria-label="Primary navigation (mobile)"]`

**Implementation**: Inline script in `SiteHeader.astro` with focus management.

### 6.4 Search

**Engine**: MiniSearch (client-side, instant, no server required)

**Search Behavior**:
- Fields indexed: `title`, `author`
- Fuzzy matching: 0.2 tolerance
- Prefix matching enabled
- Boost: `title: 2` (titles weighted heavier)

**Input Interaction**:
- Type to filter results
- Results re-render on each keystroke
- Up to 50 results displayed
- Empty input clears results

**Keyboard Navigation**:
- From input: `ArrowDown` moves to first result
- Within results: `ArrowUp`/`ArrowDown` navigate
- From first result: `ArrowUp` returns focus to input
- `Enter` navigates to focused result

**ARIA**:
- Input: Associated with results via `#results[role="listbox"]`
- Results: `role="option"` on each item, `tabindex="-1"` (controlled focus)
- Count: `aria-live="polite"`, `aria-atomic="true"` (announces count changes)

---

## 7. Accessibility Conventions

### 7.1 Skip Navigation

**Implementation**: `<a href="#main-content" class="skip-nav">Skip to content</a>` as first `<body>` child

**Behavior**:
- Hidden by default (`transform: translateY(-100%)`)
- On focus, slides down (`transform: translateY(0)`)
- Auto-focuses on `#main-content` when clicked
- Keyboard users tap Tab once to reveal and activate

**WCAG Level**: AAA (exceeds AA)

### 7.2 Focus Management & Keyboard Navigation

**Focus-visible Styling** (all interactive elements):

```css
a:focus-visible,
button:focus-visible,
.action:focus-visible,
.list-title:focus-visible,
input:focus-visible {
  outline: var(--focus-ring); /* 2px solid accent */
  outline-offset: 2px;
  border-radius: 4px;
}

.poem-lines li[role="button"]:focus-visible {
  outline: var(--focus-ring);
  outline-offset: -2px; /* Inset for lines */
  background: color-mix(in oklab, var(--accent) 12%, transparent);
  border-radius: 2px;
}

#results [role="option"]:focus {
  outline: var(--focus-ring);
  outline-offset: -2px;
  background: color-mix(in oklab, var(--accent) 8%, transparent);
}
```

**Keyboard Trap Prevention**:
- Mobile menu has focus trap (intentional); Escape exits
- All other interactive elements allow normal Tab navigation

### 7.3 ARIA Patterns

**Navigation**:
- `.nav[aria-label="Primary"]` — Desktop navigation
- `.mobile-nav[aria-label="Primary navigation (mobile)"]` — Mobile navigation (distinct label)

**Buttons & States**:
- Theme toggle: `[aria-pressed="false|true"]` — Indicates toggle state
- Menu toggle: `[aria-haspopup="true"]`, `[aria-expanded="false|true"]`, `[aria-controls="mobile-menu"]`

**Poem Reader**:
- `.poem-lines[aria-label="Poem"]` — Container semantic
- Non-blank line: `role="button"`, `aria-label="Line N"`, `aria-roledescription="selectable line"`
- Blank line: `aria-label="Stanza break"`

**Search**:
- Input: Implicit `<input type="search">` (role="searchbox")
- Results: `role="listbox"`, `aria-label="Search results"`
- Items: `role="option"`
- Count: `aria-live="polite"`, `aria-atomic="true"`

**Status Messages**:
- Toast: `role="status"`, `aria-live="polite"` (implicit)
- Announced after copy action

### 7.4 Color Contrast

**WCAG 2.1 AA Compliance** (all text ≥4.5:1):

- Primary text: 16.3:1 (light) / 17.1:1 (dark)
- Muted text: 6.7:1 (light) / 10.0:1 (dark)
- Accent on buttons: 5.0:1 (light) / 9.4:1 (dark)

**Note**: Light-theme accent on background (4.7:1) is minimally compliant. Avoid further accent color reduction.

### 7.5 Reduced Motion Support

**Implementation**:

```css
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; }
  .toast { transition: none; }
}
```

**Applied to**: Toast notification animation (fade-in, slide-up disabled)

**Future**: Skip-nav slide transition could also be disabled under reduced motion.

### 7.6 Semantic HTML

**Elements**:
- `<header>` for site header
- `<main id="main-content">` for page content
- `<footer>` for page footer
- `<article class="reader">` for poem page wrapper
- `<ol class="poem-lines">` for poetry (ordered list)
- `<nav>` for navigation regions

**Headings**:
- Proper nesting: h1 per page, h2 for sections
- No skipped levels (e.g., h1 → h3)

### 7.7 Image Alternatives

**Not currently used**: No images in main layout (favicon, OG image are metadata)

**Future**: Any embedded images should have `alt` text describing content or purpose.

---

## 8. Migration Notes

### 8.1 Tokens Fully Adopted

✓ Typography: `--serif`, `--sans`, `--mono`, `--text-*`, `--line-height-*`
✓ Colors: All `--bg`, `--ink`, `--muted`, `--accent`, component-specific colors
✓ Layout: `--measure`, `--measure-reader`, `--grid-min`
✓ Border & Radius: `--radius`, `--radius-sm`, `--radius-pill`
✓ Interactive: `--focus-ring`, `--focus-offset`, `--transition-fast`
✓ Spacing: `--space-*` tokens applied to `.skip-nav`

### 8.2 Inline Styles Still Present

The following files contain inline `style` attributes that could migrate to CSS tokens or classes:

**`page-index.astro`**:
- `style="margin: 0.1rem 0 0.1rem;"` (featured poem title)
- `style="margin: 0 0 0.6rem;"` (featured poem author)

**`page-browse.astro`**:
- `style="margin-top:0.25rem; font-family: var(--sans); font-size: 0.92rem;"` (author count, appears 2x)
- `style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:baseline;"` (poem row)

**`page-search.astro`**:
- `style="flex: 1 1 18rem; padding: 0.6rem 0.75rem; border-radius: 12px; border: 1px solid var(--card-border); background: color-mix(in oklab, var(--paper) 92%, transparent); font-family: var(--sans); font-size: 1rem;"` (search input — complex)
- `style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;"` (input + pill wrapper)
- `style="margin-top: 0.75rem;"` (results list)
- `style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:baseline;"` (search result row)
- `style="margin-top:0.25rem; font-family: var(--sans); font-size: 0.92rem;"` (century/count)

**`page-poem.astro`**:
- `style="margin: 0 0.35rem;"` (byline divider)
- `style="margin:0.9rem 0 0;"` (footer tip)

**`page-author.astro`**:
- `style="margin-top:0.25rem; font-family: var(--sans); font-size: 0.92rem;"` (century/count, appears 1x)
- `style="margin-top:1rem;"` (actions wrapper)

### 8.3 Magic Numbers Not Tokenized

Several recurring spacing values lack token names:

| Value | Occurrences | Suggested Token |
|---|---|---|
| 0.35rem | 2 | `--space-sm` or new `--space-xs-plus` |
| 0.6rem | 5+ | `--space-md` or `--space-sm-plus` |
| 0.25rem | 4+ | `--space-xs` |
| 0.55rem | 3+ | `--space-sm-plus` |
| 0.65rem | 8+ | Between `--space-sm` (0.5) and `--space-md` (0.75) |

**Recommendation**: Rather than creating new tokens, map existing ones more carefully or define intermediate values:
- `--space-xs: 0.25rem`
- `--space-xs-plus: 0.35rem` (new)
- `--space-sm: 0.5rem`
- `--space-sm-plus: 0.65rem` (new)
- `--space-md: 0.75rem`

### 8.4 Responsive Breakpoint Tokens

Consider formalizing breakpoints as tokens:

```css
--bp-mobile: 520px;
--bp-tablet: 820px;
```

Then use in media queries:

```css
@media (max-width: var(--bp-mobile)) { ... }
```

Currently hardcoded as `520px` and `820px` throughout.

### 8.5 Font Size Tokens

Many inline `font-size` values could use `--text-*` tokens:

- Search input: `font-size: 1rem` → `var(--text-lg)` or new `--text-input: 1rem`
- Metadata: `font-size: 0.92rem` → `var(--text-md)`
- Pills: `font-size: 0.78rem` → `var(--text-xs)`

### 8.6 Suggested Next Steps

**Priority 1 — Low risk, high clarity**:
1. Extract CSS classes for repeated inline flex layouts (`.flex-row-baseline`, `.flex-center-wrap`)
2. Convert all `font-size` values to `--text-*` tokens
3. Define intermediate spacing tokens (`--space-xs-plus`, `--space-sm-plus`)

**Priority 2 — Medium refactor**:
4. Replace inline `style` in `.astro` files with CSS class names
5. Add breakpoint tokens and refactor media queries

**Priority 3 — Polish**:
6. Extend `prefers-reduced-motion` to skip-nav and other transitions
7. Consider adding color tokens for component states (e.g., `--focus-bg`, `--hover-bg`)
8. Document component CSS class naming conventions for consistency

---

## 9. Summary

The Freeverse design system is built on a strong foundation of:

- **Color tokens** supporting both light (warm paper) and dark (lamplit) themes with WCAG AA certified contrast
- **Typography tokens** for a three-tiered font stack (serif, sans, mono) with responsive type scales
- **Spacing & layout tokens** enabling consistent, responsive spacing and measure
- **Accessible interactive patterns** including keyboard navigation, focus management, ARIA labels, and focus-visible styling
- **Reusable components** for cards, grids, lists, buttons, modals, and specialized poetry-reading UI

**Key principles**:
- Poetry should feel like a published page, not a widget (serif, ample line-height, narrow measure)
- Mobile-first responsiveness at 520px and 820px breakpoints
- Theme awareness (system default, light, dark) with smooth transitions
- Accessibility-first (keyboard nav, ARIA, color contrast, skip links, reduced motion)
- Token-driven design with documented migration path for remaining inline styles

**Current maturity**: Tokens well-established; components well-structured; accessibility robust. Incremental refactoring of inline styles recommended as part of routine maintenance.
