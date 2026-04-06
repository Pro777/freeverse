import type { PoemMeta } from './poems';
import type { CollectionWithPoems } from './collections';

function normalizeBaseUrl(siteUrl: string): string {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export function buildSitemapUrls(
  siteUrl: string,
  poems: PoemMeta[],
  collections: CollectionWithPoems[],
): string[] {
  const base = normalizeBaseUrl(siteUrl);
  const authors = Array.from(new Set(poems.map((poem) => poem.author_slug))).sort();
  const poemIds = poems.map((poem) => poem.id).sort();
  const collectionSlugs = collections.map((collection) => collection.slug).sort();

  const staticPaths = [
    '',
    'browse/',
    'authors/',
    'search/',
    'collections/',
    'favorites/',
    'easter/',
    'freeversebrowse/',
  ];

  const urls = new Set(staticPaths.map((path) => `${base}${path}`));

  authors.forEach((slug) => {
    urls.add(`${base}author/${slug}/`);
  });

  poemIds.forEach((id) => {
    urls.add(`${base}poem/${id}/`);
    urls.add(`${base}freeversepoem/${id}/`);
  });

  collectionSlugs.forEach((slug) => {
    urls.add(`${base}collections/${slug}/`);
  });

  return Array.from(urls).sort();
}

export function buildSitemapXml(urls: string[]): string {
  const body = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}
