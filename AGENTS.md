# AGENTS.md (freeverse)

This repo is public-domain poetry + a static reader.

## Repo principles
- Poetry text is stored in-repo under `poems/` (for v1).
- **Do not reflow or “pretty print” poem line breaks.** Stable line numbers are a feature.
- One poem per file.
- Every poem needs matching metadata in `meta/` (see `meta/SCHEMA.md`).

## Quick start
- Dev server:
  - `cd site && npm run dev`
- Production build:
  - `cd site && npm run build`

## Adding a poem
1) Create `poems/<author-slug>/<poem-slug>.txt`
2) Create `meta/<author-slug>/<poem-slug>.yml`
3) Ensure provenance is explicit (source URL + public-domain rationale)

## Current work
- See GitHub Issues for the build plan.
