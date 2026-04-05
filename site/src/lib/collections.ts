import { loadPoemMetas, type PoemMeta } from './poems';
import { collectionRecords } from './collection-records.mjs';

export type CollectionRecord = {
  slug: string;
  title: string;
  dek: string;
  description: string;
  poemIds: string[];
};

export type CollectionWithPoems = CollectionRecord & {
  poems: PoemMeta[];
};

export type RelatedPoem = {
  poem: PoemMeta;
  reason: string;
};

export async function loadCollections(): Promise<CollectionWithPoems[]> {
  const poems = await loadPoemMetas();
  const poemById = new Map(poems.map((poem) => [poem.id, poem]));

  return collectionRecords.map((collection) => {
    const missingPoemIds: string[] = [];
    const collectionPoems = collection.poemIds.flatMap((poemId) => {
      const poem = poemById.get(poemId);

      if (!poem) {
        missingPoemIds.push(poemId);
        return [];
      }

      return [poem];
    });

    if (missingPoemIds.length > 0) {
      console.warn(
        `Collection "${collection.slug}" is missing poem IDs: ${missingPoemIds.join(', ')}`,
      );
    }

    return {
      ...collection,
      poems: collectionPoems,
    };
  });
}

export async function loadCollectionBySlug(slug: string): Promise<CollectionWithPoems | undefined> {
  const collections = await loadCollections();
  return collections.find((collection) => collection.slug === slug);
}

export async function loadRelatedPoems(poemId: string, limit = 4): Promise<RelatedPoem[]> {
  const poems = await loadPoemMetas();
  const targetPoem = poems.find((poem) => poem.id === poemId);
  if (!targetPoem) return [];

  const collections = await loadCollections();
  const suggestions = new Map<string, RelatedPoem>();

  for (const collection of collections) {
    if (!collection.poemIds.includes(poemId)) continue;

    for (const poem of collection.poems) {
      if (poem.id === poemId || suggestions.has(poem.id)) continue;
      suggestions.set(poem.id, {
        poem,
        reason: `Also in ${collection.title}`,
      });
      if (suggestions.size >= limit) return Array.from(suggestions.values());
    }
  }

  const sameAuthorPoems = poems
    .filter((poem) => poem.id !== poemId && poem.author_slug === targetPoem.author_slug)
    .sort((a, b) => a.title.localeCompare(b.title));

  for (const poem of sameAuthorPoems) {
    if (suggestions.has(poem.id)) continue;
    suggestions.set(poem.id, {
      poem,
      reason: `More by ${targetPoem.author}`,
    });
    if (suggestions.size >= limit) break;
  }

  return Array.from(suggestions.values());
}
