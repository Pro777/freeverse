# Freeverse Public Alcove Index

Freeverse can publish a read-only, machine-oriented corpus export for Alcove-style retrieval without exposing repo internals.

## Output

Build-time export writes three generated files:

- `site/public/api/freeverse-public-corpus.jsonl`
- `site/public/api/freeverse-public-chunks.jsonl`
- `site/public/api/freeverse-public-manifest.json`
- `site/public/.well-known/alcove-collection.json`

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

- collection identity and discovery URLs
- supported retrieval modes for external clients
- corpus language coverage
- source-document and chunked artifact URLs
- record counts
- byte sizes
- SHA-256 digests
- chunking parameters
- exclusion reasons for filtered records

That makes CDN mirroring and downstream cache validation straightforward without exposing local implementation details.

## Discovery Contract

External clients should start with:

- `/.well-known/alcove-collection.json`

This discovery document is intentionally small and stable. It gives an Alcove browser client enough information to:

- identify the collection
- discover the full manifest URL
- see supported retrieval modes
- see corpus language coverage
- locate the canonical source-document and chunked exports

The full manifest remains at:

- `/api/freeverse-public-manifest.json`

Use the discovery file for bootstrap, then follow the manifest for detailed artifact metadata and cache validation.

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
   - `/.well-known/alcove-collection.json`
3. Downstream users choose:
   - source documents for custom chunking/indexing
   - pre-chunked JSONL for direct Alcove-style ingest
4. Browser clients or extensions can discover the corpus through `.well-known` without site-specific logic.
5. Retrieval systems ingest those public artifacts instead of scraping site HTML.

## Browser Plugin Shape

For a browser Alcove client, the intended flow is:

1. Fetch `/.well-known/alcove-collection.json`.
2. Read the manifest URL and artifact URLs.
3. Choose a mode:
   - keyword search directly over downloaded chunks
   - local client-side semantic indexing after download
4. Cache downloaded artifacts locally in the browser or extension storage.

This keeps Freeverse static and slim while letting external clients own the heavier retrieval logic.

## Future Work

- Publish a signed manifest if downstream consumers need stricter provenance checks.
- Add collection-level JSON schema documentation for external integrators.
- See `docs/hosted-semantic-search.md` for the separate Hetzner-hosted Alcove design and fallback strategy when Freeverse wants live multilingual semantic retrieval instead of static-only exports.
