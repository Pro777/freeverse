/**
 * favorites.ts — localStorage helpers for starred poems.
 *
 * Storage key: "freeverse-favorites"
 * Value: JSON array of poem ID strings, e.g. ["keats/ode-to-autumn", "horace/odes-1-1"]
 *
 * All functions are safe to call in SSR/build contexts: they guard against
 * missing `window`/`localStorage` and swallow storage errors silently.
 */

const STORAGE_KEY = "freeverse-favorites";

function readRaw(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function writeRaw(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota exceeded or storage blocked — fail silently
  }
}

/** Return all starred poem IDs. */
export function getFavorites(): string[] {
  return readRaw();
}

/** Return true if the given poem ID is starred. */
export function isFavorite(id: string): boolean {
  return readRaw().includes(id);
}

/**
 * Toggle the starred state of a poem.
 * Returns the new state: true = now starred, false = now unstarred.
 */
export function toggleFavorite(id: string): boolean {
  const current = readRaw();
  const idx = current.indexOf(id);
  if (idx === -1) {
    writeRaw([...current, id]);
    return true;
  } else {
    writeRaw(current.filter((x) => x !== id));
    return false;
  }
}

/** Emit a custom event so other parts of the page can react to changes. */
export function dispatchFavoritesChange(): void {
  try {
    window.dispatchEvent(new CustomEvent("freeverse:favorites-change"));
  } catch {
    // ignore
  }
}
