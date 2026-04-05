import { describe, expect, it } from 'vitest';

import { detectThemes, expandSearchTerms, tokenizeSearchText } from '../../src/lib/search-taxonomy.mjs';

describe('search taxonomy', () => {
  it('strips generic search filler words', () => {
    expect(tokenizeSearchText('poems about grief and loss')).toEqual(['grief', 'loss']);
  });

  it('expands thematic queries into semantic terms', () => {
    const expanded = expandSearchTerms('poems about grief');

    expect(expanded).toContain('grief');
    expect(expanded).toContain('mourning');
    expect(expanded).toContain('funeral');
  });

  it('detects themes from poem text signals', () => {
    const themes = detectThemes('I felt a Funeral, in my Brain, and grief kept treading.');

    expect(themes.map((theme) => theme.id)).toContain('grief');
  });
});
