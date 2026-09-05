import { describe, expect, it } from 'vitest';

import { poemPath } from '../../src/lib/i18n';

describe('poemPath', () => {
  it('preserves the separator in compound poem ids', () => {
    expect(poemPath('/', 'walt-whitman/o-captain-my-captain')).toBe(
      '/poem/walt-whitman/o-captain-my-captain/',
    );
  });

  it('encodes each id segment independently', () => {
    expect(poemPath('/freeverse/', 'author name/poem title', 'fr')).toBe(
      '/freeverse/fr/poem/author%20name/poem%20title/',
    );
  });
});
