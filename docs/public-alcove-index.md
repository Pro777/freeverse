# Freeverse Public Alcove Index

Freeverse can publish a read-only, machine-oriented corpus export for Alcove-style retrieval without exposing repo internals.

## Output

Build-time export writes three generated files:

- `site/public/api/freeverse-public-corpus.jsonl`
- `site/public/api/freeverse-public-chunks.jsonl`
- `site/public/api/freeverse-public-manifest.json`

These files are generated during `npm run build` and are intentionally gitignored.

## Source-Document Export

Each JSONL line in `freeverse-public-corpus.jsonl` is one source poem document:

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

This is the canonical public corpus export:

- stable `source_id`
- full source document text
- compact per-document metadata
- public canonical URL and upstream source provenance

## Chunked Alcove Export

Each JSONL line in `freeverse-public-chunks.jsonl` is one deterministic chunk:

```json
{
  "id": "gustavo-adolfo-becquer/rima-053:0",
  "source": "gustavo-adolfo-becquer/rima-053",
  "chunk": "Volverán las oscuras golondrinas...",
  "metadata": {
    "collection": "freeverse_public",
    "author": "Gustavo Adolfo Bécquer",
    "poem_url": "https://thefreeverse.org/poem/gustavo-adolfo-becquer/rima-053/",
    "source_document_url": "https://thefreeverse.org/poem/gustavo-adolfo-becquer/rima-053/",
    "text_locale": "es",
    "chunk_index": 0,
    "chunk_start": 0,
    "chunk_end": 412
  }
}
```

This mirrors Alcove-style `chunks.jsonl` expectations:

- stable chunk `id`
- stable parent `source`
- single `chunk` text field
- lightweight metadata for provenance and display

Chunking is deterministic:

- strategy: character-window over whitespace-normalized text
- size: `1000`
- overlap: `150`

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

## Manifest

The manifest includes:

- source-document and chunked artifact URLs
- record counts
- byte sizes
- SHA-256 digests
- chunking parameters
- exclusion reasons for filtered records

That makes CDN mirroring and downstream cache validation straightforward without exposing local implementation details.

## CDN Model

This export is suitable for static CDN hosting because it is:

- deterministic
- cacheable
- read-only
- safe to mirror publicly

Recommended pattern:

1. Freeverse build generates the JSONL corpus, chunked export, and manifest.
2. CDN serves:
   - `/api/freeverse-public-corpus.jsonl`
   - `/api/freeverse-public-chunks.jsonl`
   - `/api/freeverse-public-manifest.json`
3. Downstream users choose:
   - source documents for custom chunking/indexing
   - pre-chunked JSONL for direct Alcove-style ingest
4. Retrieval systems ingest those public artifacts instead of scraping site HTML.

## Future Work

- Publish a signed manifest if downstream consumers need stricter provenance checks.
- Add collection-level JSON schema documentation for external integrators.
