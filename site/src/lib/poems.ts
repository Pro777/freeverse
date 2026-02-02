import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

export type PoemMeta = {
  id: string;
  slug: string;
  author: string;
  author_slug: string;
  title: string;
  century: number;
  text_in_repo: boolean;
  text_path?: string;
  source_label?: string;
  source_url?: string;
  public_domain_rationale?: string;
  featured?: boolean;
  notes?: string;
};

function repoRootPath() {
  // Astro runs with cwd at the site/ directory during dev/build.
  return path.resolve(process.cwd(), '..');
}

function metaRootPath() {
  return path.join(repoRootPath(), 'meta');
}

export async function loadPoemMetas(): Promise<PoemMeta[]> {
  const root = metaRootPath();
  const authors = await fs.readdir(root, { withFileTypes: true });

  const metas: PoemMeta[] = [];

  for (const dirent of authors) {
    if (!dirent.isDirectory()) continue;

    const authorDir = path.join(root, dirent.name);
    const files = await fs.readdir(authorDir, { withFileTypes: true });

    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith('.yml')) continue;
      const ymlPath = path.join(authorDir, f.name);
      const raw = await fs.readFile(ymlPath, 'utf8');
      const parsed = yaml.load(raw) as PoemMeta;
      if (parsed && typeof parsed === 'object') metas.push(parsed);
    }
  }

  return metas;
}

export async function loadFeaturedPoem(): Promise<PoemMeta | undefined> {
  const metas = await loadPoemMetas();
  return metas.find((m) => m.featured);
}

export async function loadFirstStanza(poem: PoemMeta): Promise<string | undefined> {
  if (!poem.text_in_repo || !poem.text_path) return undefined;

  const poemPath = path.join(repoRootPath(), poem.text_path);
  const raw = await fs.readFile(poemPath, 'utf8');

  // First stanza: everything up to the first blank line.
  const stanza = raw.split(/\r?\n\s*\r?\n/)[0]?.trim();
  return stanza || undefined;
}
