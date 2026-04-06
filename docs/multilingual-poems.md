# Multilingual Poems Groundwork

This note defines the first safe step toward non-English poems in Freeverse.

## Core distinction

Do not treat UI language and poem language as the same thing.

- `ui_locale`: the language of the surrounding site chrome
- `text_locale`: the language of the poem text file itself

An English UI should be able to render a French, Latin, or Greek poem without changing the poem's identity.

## Metadata direction

Poem sidecars may now carry:

- `text_locale`: BCP 47 tag for the text in the repository file
- `original_language`: BCP 47 tag for the work's original language
- `text_direction`: `ltr` or `rtl`
- `translator`: translator credit when the file is a translation
- `translation_of`: canonical poem id for the source text, when applicable

Defaults for the current English corpus:

- `text_locale: en`
- `original_language: en`
- `text_direction: ltr`

These defaults are injected by the poem-index build step so existing English sidecars do not need immediate bulk edits.

## Route strategy

Keep poem identity stable and UI routing separate.

Recommended long-term shape:

- English UI: `/poem/charles-baudelaire/correspondances/`
- French UI: `/fr/poem/charles-baudelaire/correspondances/`

That means the poem id should continue to describe the work, not the UI locale.

## Rendering direction

The site should keep English as the default UI for now.

When a poem's `text_locale` differs from English, render the poem block itself with:

- `lang={text_locale}`
- `dir={text_direction}`

This is enough for screen readers and browser text handling without committing to full UI localization yet.

## Search implications

Current search remains English-biased and should not be treated as multilingual-ready.

Before ingesting substantial non-English corpus, search should be updated for:

- Unicode-aware normalization and tokenization
- locale-aware stop words
- locale-aware stemming or no stemming where inappropriate

## Conservative US copyright policy

We are operating under US copyright constraints and should stay conservative.

- Public-domain foreign-language originals may be ingested when the work is clearly public domain in the US.
- Modern translations should be treated as in-copyright unless there is explicit evidence otherwise.
- Prefer original-language texts over translations unless a translation's US public-domain basis is clear.
- When a file is a translation, record both `translator` and `translation_of`.

## Non-goals in this issue

- No full localized UI launch
- No locale-prefixed routes yet
- No multilingual search rollout yet
- No change to existing English URLs
