export function q(s: string): string {
  return encodeURIComponent(s);
}

export function authorPath(base: string, slug: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}author/${q(slug)}/`;
}
