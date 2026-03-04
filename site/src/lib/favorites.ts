const FAVORITES_KEY = "freeverse-favorites";

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseFavoriteIds(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    const ids = parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

export function readFavorites(): string[] {
  if (!hasLocalStorage()) return [];
  return parseFavoriteIds(window.localStorage.getItem(FAVORITES_KEY));
}

export function isFavorite(poemId: string): boolean {
  return readFavorites().includes(poemId);
}

export function writeFavorites(ids: string[]): void {
  if (!hasLocalStorage()) return;

  const clean = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(clean));
}

export function toggleFavorite(poemId: string): boolean {
  const id = poemId.trim();
  if (!id) return false;

  const favorites = readFavorites();
  if (favorites.includes(id)) {
    writeFavorites(favorites.filter((entry) => entry !== id));
    return false;
  }

  writeFavorites([...favorites, id]);
  return true;
}
