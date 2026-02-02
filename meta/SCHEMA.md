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
```

## Notes
- `id` is the canonical key.
- If `text_in_repo` is `false`, omit `text_path`.
- Keep `public_domain_rationale` short but explicit.
