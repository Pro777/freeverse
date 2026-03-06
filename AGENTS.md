# AGENTS.md — Freeverse

This extends the universal rules in `rowan/templates/AGENTS.md`. Rules here are additive or override.

---

## Project Context

- Public-domain poetry corpus + Astro static site.
- Corpus owner: Rowan/John. Ingest agent: Codex (primary), Campion (as needed).

**Directory layout:**
```
poems/{author-slug}/{poem-slug}.txt   — poem text, one file per poem
meta/{author-slug}/{poem-slug}.yml    — metadata sidecar, required for every poem
scripts/                              — ingest and utility scripts
site/                                 — Astro app (monorepo)
site/src/lib/authors.ts               — author bio/date registry
```

---

## Before You Build Anything

In addition to the universal rules, read these first in this project:

- `site/package.json` — build scripts live here, not at repo root
- `scripts/` — check for existing ingest scripts before writing a new one
- `meta/` — check for existing metadata before ingesting a source again
- `meta/SCHEMA.md` — canonical field definitions

---

## Poem File Rules

- Do not reflow or "pretty print" poem line breaks. Stable line numbers are a feature.
- One poem per file.
- Every poem needs a matching metadata sidecar. No poem file without a corresponding `.yml`.

---

## Corpus Ingest Rules

- **Script naming**: `ingest-{source}-{subject}.mjs` — e.g., `ingest-gutenberg-shakespeare.mjs`, `ingest-wikisource-keats.mjs`
- Never use a generic name like `gutenberg-ingest.mjs` or `ingest.mjs` — it will collide with other waves.
- Approved sources only: **Project Gutenberg**, **Wikisource**. No other sources without explicit authorization.
- Strip Gutenberg boilerplate (header and footer) from poem text before writing files.

**Required metadata fields** (see `meta/SCHEMA.md` for full spec):
```yaml
title:
author:
source_url:
license:
public_domain_rationale:
century:
```

- Use `js-yaml` for all YAML read/write. No hand-rolled parsers.

---

## Build Artifacts — Never Commit

These are generated. Add to `.gitignore` if not already present:

- `poem-index.json`
- `dedupe-report.json`
- Any output file produced by an ingest script

---

## Author Data

- Author bios and dates live in `site/src/lib/authors.ts`.
- New authors must get an entry here before poems are ingested for them.
- Handle BC dates correctly: display as `"65 BC"`, not `"-65"` or `"-65 BCE"`.

---

## Site (Astro)

- Dev server: `cd site && npm run dev`
- Production build: `cd site && npm run build`
- Build scripts are in `site/package.json`. Run from `site/`, not repo root.
- If Astro build is unavailable in your environment (e.g., Codex on BLD), note it in the PR. Corpus PRs do not require a successful site build to merge.

---

## Queue Scope

When working inside this repo's mounted worktree, "the queue" means only:
- the issue implied by the current branch, if the branch is named `codex/<issue>-<slug>`
- this repo's open GitHub issues labeled `Codex`

Do not inspect or act on Rowan/global queue items or on other repositories unless the user explicitly instructs you to switch repos.

If no repo-local Codex issue exists, report that the repo-local queue is empty and stop.

## Queue Resolution Order

Before starting new work, resolve scope in this order:
1. Current branch assignment
2. Open PR already associated with the current branch or issue
3. Open issues in this repo labeled `Codex`
4. Otherwise: stop and report no repo-local Codex work

## Duplicate Work Guard

Before creating a branch, commit, or PR:
- check for open PRs in this repo
- check for open issues in this repo labeled `Codex`
- check whether the current branch already corresponds to the active issue

If an open PR already exists for the issue, do not create another PR unless the user explicitly asks.
If another Codex branch or PR already exists for the same issue, stop and report the overlap.

## Worktree Boundary

A mounted permanent worktree is a hard project boundary.
Do not leave this repo to work in another repo because another queue appears non-empty.
Do not reinterpret "the queue" as org-wide or global when a repo worktree is mounted.
A permanent worktree implies one repo, one branch, one issue unless the user explicitly says otherwise.

## Communication

If the user asks for "the queue" and scope is ambiguous, prefer the repo-local interpretation and state that assumption briefly.
If the repo-local queue is empty, say so explicitly.
If continuing would require changing repos or leaving the current branch assignment, ask first.
