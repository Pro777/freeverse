# freeverse

Public-domain poetry, with a clean reader UI and stable line-span permalinks.

## Goals
- Store poetry in git (one poem per file, **stable line breaks**).
- Provide a fast, clean static reader UI (not GitHub’s file viewer).
- Support shareable links to specific lines/spans (`#L12-L27`).

## Live site
- GitHub Pages: https://pro777.github.io/freeverse/

## Run locally (for design/dev)
```bash
cd site
npm install
npm run dev
```
Then open the URL Astro prints (usually http://localhost:4321).

To test a production build locally:
```bash
cd site
npm run build
npm run preview
```

## Repo layout
- `poems/` — public-domain poem text files (curated)
- `meta/` — provenance + metadata per poem (see `meta/SCHEMA.md`)
- `site/` — static site (Astro)

## Policies
- **US public domain only (for now)**.
- Poetry-only. We may extract individual poems from poetry books.
- We are not trying to mirror Project Gutenberg.

See:
- `PROVENANCE.md`
- `CONTENT_LICENSE.md`
- `CONTRIBUTING.md`
