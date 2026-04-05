# Freeverse Org Transfer Plan

Repo: `Pro777/freeverse`  
Target: `Spitfire-Cowboy/freeverse`  
Last updated: 2026-04-05

## Goal

Transfer the repository into the `Spitfire-Cowboy` GitHub organization without breaking the public site, CI, or repo automation.

## Repo-Visible Current State

### Defaults and hosting
- Default branch: `main`
- Public site: GitHub Pages at `https://pro777.github.io/freeverse/`
- Deployment workflow: `.github/workflows/deploy.yml`
- Build workflow: `.github/workflows/ci.yml`

### Current GitHub Actions surface
- `ci.yml`
  - Node 20
  - runs unit coverage and site build
  - uploads coverage through Codecov using OIDC
- `deploy.yml`
  - builds the Astro site
  - deploys to GitHub Pages environment `github-pages`
- `claude.yml`
  - `@claude` issue and PR automation
  - depends on `ANTHROPIC_API_KEY`
  - uses Astro Docs MCP via `.github/claude/mcp.json`

### Secrets and environment touchpoints visible in-repo
- Required secret:
  - `ANTHROPIC_API_KEY`
- Optional production env/config mentioned in repo:
  - `PUBLIC_KAPA_WEBSITE_ID`
  - `PUBLIC_KAPA_ANALYTICS_ENABLED`
- GitHub-managed environment:
  - `github-pages`

### Integration/config files visible in-repo
- `.coderabbit.yaml`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/claude.yml`

### In-repo URLs and ownership references to recheck after transfer
- `README.md`
  - GitHub Pages URL points at `https://pro777.github.io/freeverse/`
- `site/src/pages/index.astro`
  - repo link points at `https://github.com/Pro777/freeverse`
- `site/src/layouts/BaseLayout.astro`
  - source link points at `https://github.com/Pro777/freeverse`
- `.github/ISSUE_TEMPLATE/config.yml`
  - links still point at `https://github.com/Pro777/freeverse/...`
- `.github/pull_request_template.md`
  - reference links still point at `https://github.com/Pro777/freeverse/...`

## Manual Inventory To Capture Before Transfer

These are not fully inspectable from the repo checkout and must be recorded from GitHub settings before the move.

- Branch protection rules on `main`
- Required status checks on `main`
- Repository secrets and variables in Actions settings
- Environment-specific secrets and protection rules
- Webhooks
- Installed GitHub Apps and org/repo permissions
- Pages custom domain settings, if any
- Deploy keys, fine-grained PAT dependencies, or machine users

## Pre-Transfer Checklist

- Confirm `Spitfire-Cowboy/freeverse` is available.
- Confirm admin rights in both source owner and target org.
- Export or screenshot branch protection rules and required checks.
- Inventory repo secrets, variables, environments, and webhook settings.
- Confirm whether GitHub Pages should remain under `pro777.github.io/freeverse` temporarily or move to an org-hosted destination.
- Freeze risky settings churn during the transfer window.

## Transfer Steps

1. Transfer the repository from `Pro777` to `Spitfire-Cowboy`.
2. Re-apply branch protection and required checks on `main`.
3. Recreate or confirm Actions secrets and environment settings in the target org context.
4. Reconfirm GitHub Pages configuration and environment deployment permissions.
5. Verify GitHub Apps still have the intended access after the org move.
6. Update in-repo owner/repo links that should stop pointing at `Pro777/freeverse`.

## Post-Transfer Validation

- `git fetch` works from the new remote path.
- PRs can still open and merge against `main`.
- `CI (build)` runs successfully on a test PR.
- GitHub Pages deploy succeeds from `main`.
- Codecov comments still appear on PRs.
- CodeRabbit still attaches to PRs.
- Claude workflow still initializes when `@claude` is used, assuming `ANTHROPIC_API_KEY` is present.
- Public repo links in the site and templates no longer point at the old owner where that would be misleading.

## Recommended Immediate Follow-Up PR After Transfer

Create a small cleanup PR that only updates owner/org references and docs once the final destination URL is known. Expected files:

- `README.md`
- `site/src/pages/index.astro`
- `site/src/layouts/BaseLayout.astro`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/pull_request_template.md`

## Risks

- Branch protection may not carry over exactly as expected.
- Pages or environment permissions may drift after the move.
- GitHub App installations may need to be reauthorized at the org level.
- Hardcoded owner/repo links can silently keep pointing to redirects instead of the intended canonical path.
