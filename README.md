# freeverse

Public-domain poetry, with a clean reader UI and stable line-span permalinks.

## Goals
- Store poems in git (one poem per file, stable line breaks).
- Provide a fast, clean static reader UI (not GitHub’s file viewer).
- Support shareable links to specific lines/spans (GitHub-style `#L12-L27`).

## Repo layout (planned)
- `poems/` — public-domain text files
- `meta/` — provenance + metadata per poem
- `site/` — static site (Astro)
