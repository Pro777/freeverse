# Freeverse metadata schema (v1)

Each poem should have a metadata file at:
- `meta/<author-slug>/<poem-slug>.yml`

## Required fields

```yaml
id: "emily-dickinson/because-i-could-not-stop-for-death"
slug: "because-i-could-not-stop-for-death"
author: "Emily Dickinson"
author_slug: "emily-dickinson"
title: "Because I could not stop for Death"
century: 19

text_path: "poems/emily-dickinson/because-i-could-not-stop-for-death.txt" # omit when text_in_repo=false
text_in_repo: true

source_label: "Project Gutenberg" # or Wikisource, etc.
source_url: "https://..."
public_domain_rationale: "Public domain (author died 1886; source distributed as PD)."

# Optional but recommended
featured: false
collection_title: "TBD"
collection_source_url: "https://..."
notes: "Any special formatting notes, alternate titles, etc."

# Optional multilingual groundwork
text_locale: "en"          # BCP 47 language tag for the text in this file
original_language: "en"    # BCP 47 language tag for the work's original language
text_direction: "ltr"      # "ltr" or "rtl"; defaults to "ltr"
translator: "Translator"   # only when this file is a translation
translation_of: "catullus/womans-faith-latin" # canonical poem id of the source text, if translated
```

## Notes
- `id` is the canonical key.
- If `text_in_repo` is `false`, omit `text_path`.
- Keep `public_domain_rationale` short but explicit.
- `text_locale` is the language of the text file itself, not the UI language.
- `original_language` may differ from `text_locale` when the file is a translation.
- Keep translation provenance conservative under US copyright law. A foreign-language original can be public domain while a modern translation is still in copyright.
