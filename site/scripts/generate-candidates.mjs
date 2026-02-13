#!/usr/bin/env node
/**
 * Generate a 100-candidate list (URLs) from a Wikisource index page.
 *
 * This is intentionally lightweight (no JSONL). It just scrapes subpage links.
 *
 * Usage:
 *   cd site
 *   node scripts/generate-candidates.mjs \
 *     --index "https://en.wikisource.org/wiki/Poems_That_Every_Child_Should_Know" \
 *     --out "../meta/candidates/poems-that-every-child-should-know-2026-02-04.md" \
 *     --count 100
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function die(msg) {
  console.error(`\nERROR: ${msg}`);
  process.exit(1);
}

function repoRootFromSite() {
  const here = process.cwd();
  if (path.basename(here) === 'site') return path.resolve(here, '..');
  let cur = here;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(cur, 'meta')) && fs.existsSync(path.join(cur, 'poems'))) return cur;
    cur = path.dirname(cur);
  }
  die('Could not locate repo root (expected meta/ and poems/).');
}

function parseArgs(argv) {
  const args = {
    index: null,
    out: null,
    count: 100,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--index') args.index = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--count') args.count = Number(argv[++i]);
    else die(`Unknown arg: ${a}`);
  }
  if (!args.index) die('Missing --index');
  if (!args.out) die('Missing --out');
  if (!Number.isInteger(args.count) || args.count < 1) die('Invalid --count');
  return args;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'freeverse-candidate-generator/1.0',
    },
  });
  if (!res.ok) die(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

function extractSubpages(html, indexUrl) {
  // Pull /wiki/<Title>/<Subpage> links
  const m = indexUrl.match(/\/wiki\/(.+)$/);
  if (!m) die(`Index URL must look like https://.../wiki/<Title>: ${indexUrl}`);
  const baseTitle = m[1];
  const escapedTitle = baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const re = new RegExp(`/wiki/${escapedTitle}/[^"#? ]+`, 'g');
  const hits = html.match(re) || [];
  const urls = Array.from(new Set(hits))
    .map((p) => `https://en.wikisource.org${p}`)
    .filter((u) => !/Acknowledgments|Preface|Index|Part_|Notes/i.test(u));
  return urls;
}

function toMarkdown(indexUrl, urls) {
  const lines = [];
  lines.push(`# Candidate poems (${urls.length})`);
  lines.push('');
  lines.push(`Source index: ${indexUrl}`);
  lines.push('');
  lines.push('One URL per line (ranked by appearance in the index HTML).');
  lines.push('');
  urls.forEach((u, i) => lines.push(`${String(i + 1).padStart(3, '0')}. ${u}`));
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const repoRoot = repoRootFromSite();

  const html = await fetchText(args.index);
  const urls = extractSubpages(html, args.index).slice(0, args.count);

  const outAbs = path.resolve(process.cwd(), args.out);
  const outDir = path.dirname(outAbs);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outAbs, toMarkdown(args.index, urls), 'utf8');

  console.log(`Wrote ${urls.length} candidates to ${path.relative(repoRoot, outAbs)}`);
}

await main();
