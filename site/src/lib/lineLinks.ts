export type LineRange = { start: number; end: number };

/** Parse a fragment like "#l12" or "#l12-l17" into a normalized range. */
export function parseLineHash(hash: string): LineRange | null {
  const h = (hash || '').replace(/^#/, '');
  if (!h) return null;

  const m = h.match(/^l(\d+)(?:-l(\d+))?$/);
  if (!m) return null;

  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a <= 0 || b <= 0) return null;

  const start = Math.min(a, b);
  const end = Math.max(a, b);
  return { start, end };
}

/** Build a fragment like "#l12" or "#l12-l17" from a (possibly unordered) pair. */
export function buildLineHash(start: number, end: number): string {
  const a = Number(start);
  const b = Number(end);
  const s = Math.min(a, b);
  const e = Math.max(a, b);
  return s === e ? `#l${s}` : `#l${s}-l${e}`;
}
