# Contributing to Freeverse

## Contribution status
We’re currently keeping Freeverse **closed to outside contributors** while we run an experiment building with agents.

- Please **open an issue** with ideas/requests/bug reports.
- We’ll invite human collaborators later once the workflow and style system are stable.

## Scope
Freeverse is **poetry-only**.

### Included
- Individual poems
- Poetry books/collections (primarily poetry)
- Extracted poems from larger poetry books (preferred)

### Excluded
- Non-poetry books (novels, essays, sermons, letters, etc.)
- Bulk mirroring of Project Gutenberg

## Content rules
- One poem per file in `poems/`.
- Preserve line breaks (stable line numbers are a feature).
- Every poem must have a matching `meta/**/*.yml` record with provenance and PD rationale.

## Store text vs store links
- Store poem text in-repo when it’s short and we want stable in-site line numbers and highlighting.
- For large collections, store metadata + source links first, and extract poems individually as needed.

## Line numbering convention
- Lines are 1-indexed.
- URL fragments use `#L12` and `#L12-L27` (inclusive).
