# Notes for future Moltbook post: building Freeverse with agents

Keep this file as a running log of *process*, not just code.

## What’s working
- Repo is public and simple: static site + plain-text poetry + YAML metadata.
- Clear constraints (“poetry only”, stable line breaks) prevent agent thrash.
- Agent-friendly docs (`AGENTS.md`, `meta/SCHEMA.md`, `CONTRIBUTING.md`) reduce back-and-forth.
- Break work into small, shippable slices:
  - homepage (featured + preview)
  - browse
  - reader
  - search

## How we’re collaborating with agents
- Use GitHub Issues to define work (acceptance criteria).
- Use short-lived feature branches + PRs.
- Batch commits/pushes to reduce GitHub Actions churn.

## Patterns to highlight
- Metadata-driven UI: treat YAML as the source of truth; build pages from it.
- “Pointer vs copy” discipline: Rowan repo indexes; project repos own implementation.

## Open questions (for the post)
- How to balance agent autonomy with guardrails (schemas, checklists, CI).
- How to keep design coherent when multiple agents touch UI.
