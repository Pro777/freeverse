# Provenance & Public Domain Policy (US-only for now)

Freeverse publishes **US public-domain** poetry with a clear paper trail.

This is a small project; we want to be generous with readers and careful with rights.

## Scope (v1)
- **Jurisdiction:** United States public domain only (for now).
- **We publish poems, not books:** we can ingest from anthologies, but we split into individual poems when feasible.

## Sources

### Canonical sources (text-of-record)
A poem can be published automatically only if the text comes from one of these:
- **Project Gutenberg** (preferred)
- **Wikisource**

Everything else is **discovery/reference** only.

### Discovery/reference sources
These can suggest candidates or help verify formatting/variants, but we do not treat them as canonical text:
- curated lists (e.g. poets.org anthologies)
- hobbyist indexes (e.g. “public domain poetry” sites)
- other archives unless licensing/provenance is explicit

## Publishability checklist
A poem is **publishable** only if all are true:

1) **Provenance**
- we have a canonical URL + stable ID (e.g., `gutenberg:1041`, `wikisource:<page>`)

2) **Rights basis recorded**
- source indicates public domain **and** we record at least one of:
  - author death year (if known)
  - publication year/edition of the text
- if uncertain, mark `candidate` and do not publish

3) **Integrity checks**
- remove Gutenberg headers/footers
- text is non-empty and line breaks look sane

## Dedupe / variants
We avoid publishing duplicates.

- Compute a **normalized fingerprint** of each poem (normalize whitespace, punctuation, quotes/dashes; lowercase).
- Store both:
  - `text_sha256` (exact)
  - `normalized_sha256` (dedupe)

Rules:
- If `normalized_sha256` matches an existing poem: treat as the **same poem**.
  - Keep one canonical text.
  - Add the new source to a `sources[]` list.
- If it’s a near-match (high similarity): mark as `variant` and require manual review.

## Minimal metadata per poem (v1)
- `canonical_source`: `{ type, id, url, retrieved_at }`
- `sources`: additional references (optional)
- `rights`: `{ jurisdiction: "US", basis, notes }`
- `text_sha256`, `normalized_sha256`
- `status`: `candidate | verified | ingested | published`

## Notes
This policy should stay short and practical. When we expand beyond US-only, we’ll add a jurisdiction matrix.
