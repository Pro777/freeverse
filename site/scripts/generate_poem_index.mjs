import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';

const SITE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(SITE_ROOT, '..');
const META_ROOT = path.join(REPO_ROOT, 'meta');
const OUTPUT_PATH = path.join(SITE_ROOT, 'src', 'generated', 'poem-index.json');

function sha256(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function normalizePoemText(raw) {
  return raw
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function diceCoefficient(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const grams = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const gram = a.slice(i, i + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }

  let overlap = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const gram = b.slice(i, i + 2);
    const count = grams.get(gram) ?? 0;
    if (count > 0) {
      grams.set(gram, count - 1);
      overlap += 1;
    }
  }

  return (2 * overlap) / ((a.length - 1) + (b.length - 1));
}

function canonicalSourceFromUrl(urlString) {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, '');

    const gutenberg = pathname.match(/\/ebooks\/(\d+)$/);
    if (host.includes('gutenberg.org') && gutenberg) {
      return { type: 'gutenberg', id: `gutenberg:${gutenberg[1]}`, url: url.toString() };
    }

    if (host.includes('wikisource.org')) {
      const slug = pathname.replace(/^\/+/, '') || 'root';
      return { type: 'wikisource', id: `wikisource:${slug}`, url: url.toString() };
    }

    const refId = `${host}${pathname || '/'}`;
    return { type: 'reference', id: refId, url: url.toString() };
  } catch {
    return null;
  }
}

function validateMeta(meta, filePath) {
  const errors = [];
  const isObj = meta && typeof meta === 'object' && !Array.isArray(meta);
  if (!isObj) {
    return [`${filePath}: YAML must parse into an object`];
  }

  const requiredStrings = ['id', 'slug', 'author', 'author_slug', 'title', 'source_label', 'source_url', 'public_domain_rationale'];
  for (const key of requiredStrings) {
    const value = meta[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${filePath}: missing required string field "${key}"`);
      continue;
    }
    if (value.trim().toUpperCase() === 'TBD') {
      errors.push(`${filePath}: field "${key}" cannot be "TBD"`);
    }
  }

  if (!Number.isInteger(meta.century) || meta.century === 0) {
    errors.push(`${filePath}: "century" must be a non-zero integer`);
  }

  if (typeof meta.text_in_repo !== 'boolean') {
    errors.push(`${filePath}: "text_in_repo" must be boolean`);
  }

  if (typeof meta.id === 'string' && typeof meta.author_slug === 'string' && typeof meta.slug === 'string') {
    const expectedId = `${meta.author_slug}/${meta.slug}`;
    if (meta.id !== expectedId) {
      errors.push(`${filePath}: "id" must equal "${expectedId}"`);
    }
  }

  if (meta.text_in_repo === true) {
    if (typeof meta.text_path !== 'string' || !meta.text_path.trim()) {
      errors.push(`${filePath}: "text_path" is required when text_in_repo=true`);
    }
  }

  if (typeof meta.source_url === 'string') {
    try {
      const u = new URL(meta.source_url);
      if (!/^https?:$/.test(u.protocol)) {
        errors.push(`${filePath}: source_url must be http(s)`);
      }
    } catch {
      errors.push(`${filePath}: source_url must be a valid URL`);
    }
  }

  return errors;
}

function uniqueSources(records) {
  const dedup = new Map();
  for (const r of records) {
    if (!r?.url || !r?.label) continue;
    const key = `${r.url}::${r.label}`;
    if (!dedup.has(key)) dedup.set(key, r);
  }
  return Array.from(dedup.values());
}

const authorDirs = await fs.readdir(META_ROOT, { withFileTypes: true });
const metas = [];
const errors = [];

for (const dirent of authorDirs) {
  if (!dirent.isDirectory()) continue;
  const authorDir = path.join(META_ROOT, dirent.name);
  const files = await fs.readdir(authorDir, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.yml')) continue;
    const ymlPath = path.join(authorDir, file.name);
    const raw = await fs.readFile(ymlPath, 'utf8');
    const parsed = yaml.load(raw);
    errors.push(...validateMeta(parsed, path.relative(REPO_ROOT, ymlPath)));
    if (parsed && typeof parsed === 'object') {
      metas.push(parsed);
    }
  }
}

if (errors.length) {
  console.error('Metadata validation failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

const entries = [];
const duplicateById = new Set();
const normalizedTexts = [];
const idToIndex = new Map();

for (const meta of metas) {
  if (idToIndex.has(meta.id)) duplicateById.add(meta.id);

  let rawText = '';
  if (meta.text_in_repo && meta.text_path) {
    const textPath = path.join(REPO_ROOT, meta.text_path);
    try {
      rawText = await fs.readFile(textPath, 'utf8');
      if (!rawText.trim()) {
        errors.push(`${meta.id}: text file is empty (${meta.text_path})`);
      }
    } catch {
      errors.push(`${meta.id}: missing text file (${meta.text_path})`);
    }
  }

  const exact = rawText ? sha256(rawText) : null;
  const normalized = rawText ? normalizePoemText(rawText) : '';
  const normalizedHash = normalized ? sha256(normalized) : null;

  const baseSources = uniqueSources([
    meta.source_label && meta.source_url ? { label: meta.source_label, url: meta.source_url } : null,
    meta.collection_source_url ? { label: `${meta.source_label} (collection)`, url: meta.collection_source_url } : null,
  ]);

  const canonicalSource = typeof meta.source_url === 'string'
    ? canonicalSourceFromUrl(meta.source_url)
    : null;

  entries.push({
    ...meta,
    text_sha256: exact,
    normalized_sha256: normalizedHash,
    canonical_source: canonicalSource,
    sources: baseSources,
    canonical_id: meta.id,
    variant_group: meta.id,
    is_canonical: true,
  });

  const idx = entries.length - 1;
  idToIndex.set(meta.id, idx);
  normalizedTexts.push(normalized);
}

for (const id of duplicateById) {
  errors.push(`duplicate poem id: ${id}`);
}

if (errors.length) {
  console.error('Poem ingest validation failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

// Union-find to cluster exact and near-identical texts.
const parent = entries.map((_, i) => i);
const find = (x) => {
  let r = x;
  while (parent[r] !== r) r = parent[r];
  while (parent[x] !== x) {
    const p = parent[x];
    parent[x] = r;
    x = p;
  }
  return r;
};
const union = (a, b) => {
  const ra = find(a);
  const rb = find(b);
  if (ra !== rb) parent[rb] = ra;
};

for (let i = 0; i < entries.length; i++) {
  const a = normalizedTexts[i];
  if (!a) continue;
  for (let j = i + 1; j < entries.length; j++) {
    const b = normalizedTexts[j];
    if (!b) continue;

    if (entries[i].normalized_sha256 && entries[i].normalized_sha256 === entries[j].normalized_sha256) {
      union(i, j);
      continue;
    }

    const lenRatio = a.length > b.length ? a.length / b.length : b.length / a.length;
    if (lenRatio > 1.08) continue;

    const similarity = diceCoefficient(a, b);
    if (similarity >= 0.985) union(i, j);
  }
}

const clusters = new Map();
for (let i = 0; i < entries.length; i++) {
  const root = find(i);
  const list = clusters.get(root) ?? [];
  list.push(i);
  clusters.set(root, list);
}

for (const indexes of clusters.values()) {
  const canonicalIndex = [...indexes].sort((a, b) => entries[a].id.localeCompare(entries[b].id))[0];
  const canonicalId = entries[canonicalIndex].id;
  const allSources = uniqueSources(indexes.flatMap((idx) => entries[idx].sources ?? []));

  for (const idx of indexes) {
    entries[idx].canonical_id = canonicalId;
    entries[idx].variant_group = canonicalId;
    entries[idx].is_canonical = entries[idx].id === canonicalId;
    entries[idx].sources = allSources;
  }
}

entries.sort((a, b) => {
  const author = a.author.localeCompare(b.author);
  if (author !== 0) return author;
  const title = a.title.localeCompare(b.title);
  if (title !== 0) return title;
  return a.id.localeCompare(b.id);
});

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');

console.log(`Wrote ${path.relative(SITE_ROOT, OUTPUT_PATH)} (${entries.length} poems)`);
