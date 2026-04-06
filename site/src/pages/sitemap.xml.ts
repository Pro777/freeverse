import type { APIRoute } from 'astro';
import { loadCollections } from '../lib/collections';
import { loadPoemMetas } from '../lib/poems';
import { buildSitemapUrls, buildSitemapXml } from '../lib/sitemap';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Astro site URL is required to build sitemap.xml');
  }

  const [poems, collections] = await Promise.all([
    loadPoemMetas(),
    loadCollections(),
  ]);

  const urls = buildSitemapUrls(site.toString(), poems, collections);
  const xml = buildSitemapXml(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
