# Hosted Semantic Search Design

This document defines the deployment shape for a Hetzner-hosted Alcove service that indexes the public Freeverse corpus and exposes multilingual semantic retrieval without turning the reader itself into an application server.

## Goals

- Keep `thefreeverse.org` static and cheap to operate.
- Use only the existing public corpus exports as Alcove ingest input.
- Support multilingual semantic retrieval across the current English, Spanish, French, and Italian corpus.
- Keep private implementation details and PII out of the hosted search system.
- Preserve the current static search experience when the hosted service is unavailable.

## Non-Goals

- Moving the main Freeverse reader off static hosting.
- Making semantic search a hard dependency for basic site search.
- Adding private ingestion paths or operator-local metadata.
- Shipping a bespoke ranking system before the hosted path is proven.

## Current Freeverse Inputs

Freeverse already publishes the only artifacts the hosted service needs:

- `https://thefreeverse.org/.well-known/alcove-collection.json`
- `https://thefreeverse.org/api/freeverse-public-manifest.json`
- `https://thefreeverse.org/api/freeverse-public-corpus.jsonl`
- `https://thefreeverse.org/api/freeverse-public-chunks.jsonl`

At the time of writing, the public manifest reports:

- `635` source documents
- `3652` pre-chunked records
- `0` excluded records
- artifact sizes of roughly `4.0 MB` for source documents and `8.0 MB` for chunks

That corpus size is small enough to start with one modest VPS.

## Recommended Architecture

```text
Freeverse static site
  -> publishes public manifest + chunk export on CDN

Hosted Alcove service
  -> polls manifest
  -> downloads chunk export
  -> computes multilingual embeddings
  -> stores vector index + minimal metadata
  -> serves narrow read-only search API

Freeverse search UI
  -> keeps local keyword search
  -> optionally calls hosted semantic endpoint
  -> falls back locally on timeout or failure
```

The key boundary is simple:

- Freeverse owns public corpus publication.
- Alcove owns embedding, vector storage, and semantic retrieval.
- The site never sends private repo data, local paths, or operator state to Alcove.

## Hetzner Deployment Shape

Recommended first deployment:

- one small VPS
- persistent disk for the index database
- systemd-managed Alcove process
- reverse proxy with TLS

Pragmatic starting profile:

- `2 vCPU`
- `4 GB RAM`
- `40 GB` or more SSD space

This sizing is an inference from the current public corpus size, not a permanent guarantee. It is meant to be enough for:

- the current `3652`-chunk corpus
- a multilingual embedding model
- ChromaDB or equivalent local vector storage
- modest public query traffic

If latency or memory pressure appears under real use, scale the RAM first.

## Storage and Persistence Model

Treat the vector index as rebuildable derived state.

Persist:

- Alcove database files
- downloaded manifest metadata
- service configuration
- request logs with IPs disabled or minimized

Do not persist:

- raw repo checkouts
- private build artifacts
- any non-public Freeverse files

Recommended storage rule:

- keep the working vector store on persistent disk
- keep automated snapshots/backups for faster recovery
- retain the ability to rebuild the full index from the public chunk export alone

Because the corpus is publicly downloadable, disaster recovery should not depend on a hidden ingest pipeline.

## Multilingual Retrieval Model

Use Alcove with a multilingual embedding model. The hosted service should ingest the published chunk export and embed fields derived from:

- poem title
- author
- chunk text
- `text_locale`
- `original_language`
- translator metadata when present

The search contract should support:

- English query -> French or Spanish poem results
- Spanish query -> English or French poem results
- language-aware display metadata in results

The hosted service should never rewrite or translate poem text at query time. It should retrieve the public text already published by Freeverse.

## API Boundary

Keep the hosted API narrow and read-only.

Recommended endpoints:

- `GET /health`
- `GET /collections/freeverse_public`
- `POST /collections/freeverse_public/search`

Suggested search request shape:

```json
{
  "q": "night sea prayer",
  "limit": 10,
  "mode": "semantic",
  "ui_locale": "en"
}
```

Suggested response shape:

```json
{
  "collection": "freeverse_public",
  "mode": "semantic",
  "results": [
    {
      "id": "paul-verlaine/nevermore-1:0",
      "source_id": "paul-verlaine/nevermore-1",
      "title": "Nevermore",
      "author": "Paul Verlaine",
      "poem_url": "https://thefreeverse.org/poem/paul-verlaine/nevermore-1/",
      "author_url": "https://thefreeverse.org/author/paul-verlaine/",
      "text_locale": "fr",
      "original_language": "fr",
      "text_direction": "ltr",
      "translator": "",
      "excerpt": "Souvenir, souvenir, que me veux-tu ?",
      "score": 0.842
    }
  ]
}
```

Important constraints:

- return only public fields already present in the export
- no filesystem paths
- no internal chunk hashes beyond stable public IDs
- no operator-local diagnostics in normal responses

## Sync Strategy

The hosted service should not scrape HTML pages.

Recommended sync loop:

1. Fetch `/.well-known/alcove-collection.json`.
2. Read the manifest URL.
3. Compare manifest `sha256` values for the chunk artifact.
4. If unchanged, do nothing.
5. If changed, download the new chunk export and rebuild or incrementally refresh the index.

That keeps Freeverse and Alcove loosely coupled and makes the public manifest the single source of truth.

## Fallback Strategy

Freeverse should keep static search as the default-safe path.

Recommended behavior:

- local MiniSearch remains available for every query
- semantic search is additive, not required
- if the hosted API times out or fails, render local results without blocking the page
- if semantic results arrive successfully, merge or promote them in the UI

Recommended product stance:

- default search remains instant local keyword search
- semantic mode can be automatic behind the scenes or opt-in with a toggle
- failure should degrade silently to local search, with at most a light status note

Recommended timeout:

- keep the semantic request budget short, around `700 ms` to `1200 ms`

If the hosted path cannot answer quickly, it should lose to the static path instead of slowing the site down.

## Privacy and Security Boundary

The hosted service must ingest only the public Freeverse export. That means:

- no GitHub tokens in query responses
- no local source paths
- no dedupe internals
- no user-submitted analytics payloads in the public index
- no PII beyond already-public author names and poem metadata

Operational guardrails:

- restrict CORS to intended Freeverse origins
- disable directory browsing
- rate-limit the search endpoint
- avoid storing full IP addresses in application logs when possible
- treat all semantic results as derived from public text only

## Rollout Plan

Phase 1:

- deploy Alcove on one Hetzner VPS
- ingest the current public chunk export
- expose read-only search API
- test cross-language retrieval manually

Phase 2:

- wire the Freeverse search UI to call the hosted endpoint with a short timeout
- keep MiniSearch as fallback
- ship behind a feature flag if needed

Phase 3:

- measure latency and relevance
- tune ranking and language display
- decide whether to keep the hosted path, the browser-only lab path, or both

## Decision

Recommended path:

- Freeverse stays static
- Alcove runs separately on Hetzner
- the hosted service ingests only public Freeverse exports
- the site keeps local keyword search as the guaranteed baseline

That gives Freeverse real multilingual semantic retrieval without turning the main site into an infrastructure surface it has to maintain tightly.
