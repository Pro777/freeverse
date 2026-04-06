# Freeverse Public Alcove Index

Freeverse can publish a read-only, machine-oriented corpus export for Alcove-style retrieval without exposing repo internals.

## Output

Build-time export writes two generated files:

- `site/public/api/freeverse-public-corpus.jsonl`
- `site/public/api/freeverse-public-manifest.json`

These files are generated during `npm run build` and are intentionally gitignored.

## Record Shape

Each JSONL line is one source poem document:

```json
{
  "source_id": "gustavo-adolfo-becquer/rima-053",
  "url": "https://thefreeverse.org/poem/gustavo-adolfo-becquer/rima-053/",
  "title": "Rima LIII — Gustavo Adolfo Bécquer",
  "text": "Volverán las oscuras golondrinas...",
  "metadata": {
    "collection": "freeverse_public",
    "type": "poem",
    "author": "Gustavo Adolfo Bécquer",
    "author_slug": "gustavo-adolfo-becquer",
    "poem_url": "https://thefreeverse.org/poem/gustavo-adolfo-becquer/rima-053/",
    "author_url": "https://thefreeverse.org/author/gustavo-adolfo-becquer/",
    "text_locale": "es",
    "source_url": "https://es.wikisource.org/...",
    "public_domain_rationale": "Public domain in the United States..."
  }
}
```

This is intentionally close to Alcove demo ingestion shapes:

- stable `source_id`
- full source document text
- compact per-document metadata
- public canonical URL and upstream source provenance

## Sanitization Rules

Included:

- public poem text
- public author/title/locale metadata
- Freeverse canonical URLs
- upstream public-domain source URLs
- public-domain rationale for US copyright context

Excluded:

- repo filesystem paths
- local hashes and dedupe internals
- operator-local configuration
- notes or implementation-only fields
- any local account, machine, or user data

The exporter may also exclude poem records whose opening block clearly looks like table-of-contents or edition matter instead of the poem text itself. Those exclusions are recorded in the generated manifest so the public index stays clean without hiding corpus-quality debt.

## CDN Model

This export is suitable for static CDN hosting because it is:

- deterministic
- cacheable
- read-only
- safe to mirror publicly

Recommended pattern:

1. Freeverse build generates the JSONL corpus and manifest.
2. CDN serves `/api/freeverse-public-corpus.jsonl` and `/api/freeverse-public-manifest.json`.
3. Alcove or other retrieval systems ingest from that public artifact instead of scraping the site HTML.

## Future Work

- Add optional chunked export alongside source-document export for faster zero-prep Alcove import.
- Publish a signed manifest with content digests if downstream consumers need strict provenance checks.
- Add collection-level JSON schema documentation for external integrators.
