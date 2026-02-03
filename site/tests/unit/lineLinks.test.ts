import { describe, expect, it } from 'vitest';
import { buildLineHash, parseLineHash } from '../../src/lib/lineLinks';

describe('lineLinks', () => {
  it('parses single line', () => {
    expect(parseLineHash('#l12')).toEqual({ start: 12, end: 12 });
  });

  it('parses range', () => {
    expect(parseLineHash('#l12-l17')).toEqual({ start: 12, end: 17 });
  });

  it('normalizes reversed ranges', () => {
    expect(parseLineHash('#l20-l3')).toEqual({ start: 3, end: 20 });
  });

  it('rejects invalid fragments', () => {
    expect(parseLineHash('')).toBeNull();
    expect(parseLineHash('#')).toBeNull();
    expect(parseLineHash('#foo')).toBeNull();
    expect(parseLineHash('#l0')).toBeNull();
    expect(parseLineHash('#l-1')).toBeNull();
  });

  it('builds fragments', () => {
    expect(buildLineHash(5, 5)).toBe('#l5');
    expect(buildLineHash(12, 17)).toBe('#l12-l17');
    expect(buildLineHash(17, 12)).toBe('#l12-l17');
  });
});
