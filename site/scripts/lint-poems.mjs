#!/usr/bin/env node
/**
 * Lightweight guardrails:
 *  - Required provenance / PD rationale presence
 *  - text_path exists when text_in_repo=true
 *  - duplicate detection: exact (author+title), plus fuzzy title matches within author
 *
 * Usage:
 *   cd site
 *   node scripts/lint-poems.mjs
 *
 * Exit code 0 on success, non-zero on lint failures.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';

function repoRootFromSite() {
  const here = process.cwd();
  if (path.basename(here) === 'site') return path.resolve(here, '..');
  let cur = here;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(cur, 'meta')) && fs.existsSync(path.join(cur, 'poems'))) return cur;
    cur = path.dirname(cur);
  }
  throw new Error('Could not locate repo root (expected meta/ and poems/). Run from repo root or site/.');
}

function normalizeTitle(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  a = String(a); b = String(b);
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

function fuzzyTitleMatch(t1, t2) {
  const a = normalizeTitle(t1);
  const b = normalizeTitle(t2);
  if (!a || !b) return false;
  if (a === b) return true;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  const sim = 1 - dist / maxLen;
  const allowedDist = Math.max(1, Math.floor(maxLen * 0.15));
  return sim >= 0.9 || dist <= allowedDist;
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}

function present(v) {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

function changedMetaFiles(repoRoot) {
  // Prefer staged files; if none staged, use working-tree changes vs HEAD.
  const rels = [];
  const run = (cmd) => {
    try {
      return execSync(cmd, { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8');
    } catch {
      return '';
    }
  };

  const staged = run('git diff --name-only --cached').trim().split(/\n/).filter(Boolean);
  const changed = staged.length ? staged : run('git diff --name-only HEAD').trim().split(/\n/).filter(Boolean);
  for (const f of changed) {
    if (f.startsWith('meta/') && f.endsWith('.yml')) rels.push(f);
  }
  return rels.map((r) => path.join(repoRoot, r));
}

function main() {
  const repoRoot = repoRootFromSite();
  const metaRoot = path.join(repoRoot, 'meta');

  const filesFromArgs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  let metaFiles;
  const strict = process.argv.includes('--strict');
  let lintingAll = false;
  if (filesFromArgs.length) {
    metaFiles = filesFromArgs.map((p) =>
      path.isAbsolute(p) ? p : path.resolve(repoRoot, p)
    );
  } else {
    const changed = changedMetaFiles(repoRoot);
    if (changed.length) metaFiles = changed;
    else {
      metaFiles = walk(metaRoot).filter((p) => p.endsWith('.yml'));
      lintingAll = true;
    }
  }

  const entries = [];

  const errors = [];
  const warnings = [];

  for (const file of metaFiles) {
    let data;
    try {
      data = yaml.load(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${path.relative(repoRoot, file)}: YAML parse error: ${e.message}`);
      continue;
    }

    const rel = path.relative(repoRoot, file);

    // Required fields (schema v1)
    for (const k of ['id', 'slug', 'author', 'author_slug', 'title', 'century', 'text_in_repo', 'source_label', 'source_url', 'public_domain_rationale']) {
      if (!present(data?.[k])) errors.push(`${rel}: missing required field '${k}'`);
    }

    // US PD checklist guardrail
    if (present(data?.public_domain_rationale)) {
      const r = String(data.public_domain_rationale);
      if (!/public\s+domain/i.test(r)) {
        errors.push(`${rel}: public_domain_rationale should explicitly say "Public domain"`);
      }
      if (!/united\s+states|u\.s\./i.test(r)) {
        warnings.push(`${rel}: public_domain_rationale does not mention US explicitly (ok if intentional)`);
      }
    }

    // provenance link format
    if (present(data?.source_url)) {
      const u = String(data.source_url);
      if (!/^https?:\/\//.test(u)) errors.push(`${rel}: source_url must be http(s): ${u}`);
    }

    // text file checks
    if (data?.text_in_repo === true) {
      if (!present(data?.text_path)) errors.push(`${rel}: text_in_repo=true but text_path missing`);
      else {
        const p = path.join(repoRoot, String(data.text_path));
        if (!fs.existsSync(p)) errors.push(`${rel}: text_path missing on disk: ${data.text_path}`);
        else {
          const txt = fs.readFileSync(p, 'utf8');
          if (!txt.endsWith('\n')) errors.push(`${rel}: text file must end with newline: ${data.text_path}`);
        }
      }
    }

    entries.push({
      rel,
      id: String(data?.id || ''),
      author: String(data?.author || ''),
      title: String(data?.title || ''),
    });
  }

  // Duplicate detection
  // For batch-safety we always compute duplicates against the whole repo, even if linting a subset.
  const allMetaFiles = walk(metaRoot).filter((p) => p.endsWith('.yml'));
  const allEntries = [];
  for (const file of allMetaFiles) {
    try {
      const data = yaml.load(fs.readFileSync(file, 'utf8'));
      if (!data?.author || !data?.title) continue;
      allEntries.push({
        rel: path.relative(repoRoot, file),
        author: String(data.author),
        title: String(data.title),
      });
    } catch (err) {
      // Only suppress YAML parse errors; re-throw I/O failures
      if (err.code) throw err;
    }
  }

  const byAuthorTitle = new Map();
  for (const e of allEntries) {
    const k = `${e.author}|||${e.title}`;
    if (byAuthorTitle.has(k)) {
      const prev = byAuthorTitle.get(k);
      errors.push(`DUPLICATE exact author+title: ${e.author} — ${e.title}\n  - ${prev.rel}\n  - ${e.rel}`);
    } else {
      byAuthorTitle.set(k, e);
    }
  }

  const byAuthor = new Map();
  for (const e of allEntries) {
    if (!byAuthor.has(e.author)) byAuthor.set(e.author, []);
    byAuthor.get(e.author).push(e);
  }

  for (const [author, list] of byAuthor.entries()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.title === b.title) continue;
        if (fuzzyTitleMatch(a.title, b.title)) {
          warnings.push(`POSSIBLE DUPLICATE fuzzy title (same author: ${author}):\n  - ${a.title} (${a.rel})\n  - ${b.title} (${b.rel})`);
        }
      }
    }
  }

  // If we're linting the entire repo (no batch context), default to non-blocking mode
  // to avoid legacy schema/provenance debt breaking the workflow. Use --strict to enforce.
  if (lintingAll && !strict && errors.length) {
    warnings.push(...errors.map((e) => `(non-blocking legacy) ${e}`));
    errors.length = 0;
  }

  if (warnings.length) {
    console.error('\nWARNINGS:');
    for (const w of warnings) console.error(`- ${w}`);
  }

  if (errors.length) {
    console.error('\nERRORS:');
    for (const e of errors) console.error(`- ${e}`);
    process.exit(2);
  }

  console.log(`OK: linted ${entries.length} meta files; no blocking issues.`);
}

main();
