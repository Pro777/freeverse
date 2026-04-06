import { describe, expect, it } from 'vitest';
import { buildSitemapUrls, buildSitemapXml } from '../../src/lib/sitemap';

describe('sitemap', () => {
  it('builds stable urls for static and dynamic routes', () => {
    const urls = buildSitemapUrls(
      'https://thefreeverse.org',
      [
        {
          id: 'emily-dickinson/because-i-could-not-stop-for-death',
          slug: 'because-i-could-not-stop-for-death',
          author: 'Emily Dickinson',
          author_slug: 'emily-dickinson',
          title: 'Because I could not stop for Death',
          century: 19,
          text_locale: 'en',
          original_language: 'en',
          text_direction: 'ltr',
          text_in_repo: true,
        },
        {
          id: 'walt-whitman/o-captain-my-captain',
          slug: 'o-captain-my-captain',
          author: 'Walt Whitman',
          author_slug: 'walt-whitman',
          title: 'O Captain! My Captain!',
          century: 19,
          text_locale: 'en',
          original_language: 'en',
          text_direction: 'ltr',
          text_in_repo: true,
        },
      ],
      [
        {
          slug: 'grief-and-mortality',
          title: 'Grief and Mortality',
          dek: 'Elegies and reckonings.',
          description: 'A first curated path through grief.',
          poemIds: [],
          poems: [],
        },
      ],
    );

    expect(urls).toContain('https://thefreeverse.org/');
    expect(urls).toContain('https://thefreeverse.org/browse/');
    expect(urls).toContain('https://thefreeverse.org/authors/');
    expect(urls).toContain('https://thefreeverse.org/collections/grief-and-mortality/');
    expect(urls).toContain('https://thefreeverse.org/author/emily-dickinson/');
    expect(urls).toContain('https://thefreeverse.org/poem/walt-whitman/o-captain-my-captain/');
    expect(urls).toContain('https://thefreeverse.org/freeversepoem/walt-whitman/o-captain-my-captain/');
  });

  it('renders sitemap xml with url entries', () => {
    const xml = buildSitemapXml([
      'https://thefreeverse.org/',
      'https://thefreeverse.org/browse/',
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://thefreeverse.org/</loc>');
    expect(xml).toContain('<loc>https://thefreeverse.org/browse/</loc>');
  });
});
