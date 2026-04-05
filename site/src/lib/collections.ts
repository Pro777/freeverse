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

  return collectionRecords.map((collection) => ({
    ...collection,
    poems: collection.poemIds
      .map((poemId) => poemById.get(poemId))
      .filter((poem): poem is PoemMeta => Boolean(poem)),
  }));
}

export async function loadCollectionBySlug(slug: string): Promise<CollectionWithPoems | undefined> {
  const collections = await loadCollections();
  return collections.find((collection) => collection.slug === slug);
}
