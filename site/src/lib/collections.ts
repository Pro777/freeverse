import { loadPoemMetas, type PoemMeta } from './poems';

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

const collectionRecords: CollectionRecord[] = [
  {
    slug: 'grief-and-mortality',
    title: 'Grief and Mortality',
    dek: 'Elegies, reckonings, and poems that refuse to look away.',
    description:
      'A first curated path through death, mourning, and the afterlife, moving from lyric sorrow to harder forms of endurance.',
    poemIds: [
      'edgar-allan-poe/annabel-lee',
      'edgar-allan-poe/the-raven',
      'emily-dickinson/as-imperceptibly-as-grief',
      'emily-dickinson/i-felt-a-funeral-in-my-brain',
      'emily-dickinson/because-i-could-not-stop-for-death',
      'william-ernest-henley/invictus',
    ],
  },
  {
    slug: 'romantic-odes',
    title: 'Romantic Odes',
    dek: 'A compact path through attention, beauty, and ruin.',
    description:
      'A focused route through high-Romantic intensity: urns, skylarks, autumn, memory, and the unstable promise of transcendence.',
    poemIds: [
      'john-keats/ode-to-a-nightingale',
      'john-keats/ode-on-a-grecian-urn',
      'john-keats/to-autumn',
      'percy-bysshe-shelley/ozymandias',
      'percy-bysshe-shelley/to-a-skylark',
      'samuel-taylor-coleridge/kubla-khan',
      'william-wordsworth/i-wandered-lonely-as-a-cloud',
    ],
  },
];

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
