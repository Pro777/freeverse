# AGENTS.md — Freeverse

This extends the universal rules in `rowan/templates/AGENTS.md`. Rules here are additive or override.

---

## Project Context

- Public-domain poetry corpus + Astro static site.
- Corpus owner: Rowan/John. Ingest agent: Codex (primary), Campion (as needed).

**Directory layout:**
```
poems/{author-slug}/{poem-slug}.txt   — poem text, one file per poem
meta/{author-slug}/{poem-slug}.yml    — metadata sidecar, required for every poem
scripts/                              — ingest and utility scripts
site/                                 — Astro app (monorepo)
site/src/lib/authors.ts               — author bio/date registry
```

---

## Before You Build Anything

In addition to the universal rules, read these first in this project:

- `site/package.json` — build scripts live here, not at repo root
- `scripts/` — check for existing ingest scripts before writing a new one
- `meta/` — check for existing metadata before ingesting a source again
- `meta/SCHEMA.md` — canonical field definitions

---

## Poem File Rules

- Do not reflow or "pretty print" poem line breaks. Stable line numbers are a feature.
- One poem per file.
- Every poem needs a matching metadata sidecar. No poem file without a corresponding `.yml`.

---

## Corpus Ingest Rules

- **Script naming**: `ingest-{source}-{subject}.mjs` — e.g., `ingest-gutenberg-shakespeare.mjs`, `ingest-wikisource-keats.mjs`
- Never use a generic name like `gutenberg-ingest.mjs` or `ingest.mjs` — it will collide with other waves.
- Approved sources only: **Project Gutenberg**, **Wikisource**. No other sources without explicit authorization.
- Strip Gutenberg boilerplate (header and footer) from poem text before writing files.

**Required metadata fields** (see `meta/SCHEMA.md` for full spec):
```yaml
title:
author:
source_url:
license:
public_domain_rationale:
century:
```

- Use `js-yaml` for all YAML read/write. No hand-rolled parsers.

---

## Build Artifacts — Never Commit

These are generated. Add to `.gitignore` if not already present:

- `poem-index.json`
- `dedupe-report.json`
- Any output file produced by an ingest script

---

## Author Data

- Author bios and dates live in `site/src/lib/authors.ts`.
- New authors must get an entry here before poems are ingested for them.
- Handle BC dates correctly: display as `"65 BC"`, not `"-65"` or `"-65 BCE"`.

---

## Site (Astro)

- Dev server: `cd site && npm run dev`
- Production build: `cd site && npm run build`
- Build scripts are in `site/package.json`. Run from `site/`, not repo root.
- If Astro build is unavailable in your environment (e.g., Codex on BLD), note it in the PR. Corpus PRs do not require a successful site build to merge.
