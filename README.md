# freeverse

Public-domain poetry, with a clean reader UI and stable line-span permalinks.

## Goals
- Store poetry in git (one poem per file, **stable line breaks**).
- Provide a fast, clean static reader UI (not GitHub’s file viewer).
- Support shareable links to specific lines/spans (`#L12-L27`).

## Repo layout
- `poems/` — public-domain poem text files (curated)
- `meta/` — provenance + metadata per poem (see `meta/SCHEMA.md`)
- `site/` — static site (Astro)

## Policies
- Poetry-only. We may extract individual poems from poetry books.
- We are not trying to mirror Project Gutenberg.

See:
- `CONTENT_LICENSE.md`
- `CONTRIBUTING.md`
