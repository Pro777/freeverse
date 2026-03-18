import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCES = {
  longfellow: {
    author: "Henry Wadsworth Longfellow",
    author_slug: "henry-wadsworth-longfellow",
    death_year: 1882,
    century: 19,
    source_ebook: "1365",
    collection_title: "The Complete Poetical Works of Henry Wadsworth Longfellow",
  },
  holmesEarly: {
    author: "Oliver Wendell Holmes Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    death_year: 1894,
    century: 19,
    source_ebook: "7388",
    collection_title: "The Poetical Works of Oliver Wendell Holmes - Volume 01: Earlier Poems",
  },
  holmesLate: {
    author: "Oliver Wendell Holmes Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    death_year: 1894,
    century: 19,
    source_ebook: "7393",
    collection_title: "The Poetical Works of Oliver Wendell Holmes - Volume 06",
  },
  lowell: {
    author: "James Russell Lowell",
    author_slug: "james-russell-lowell",
    death_year: 1891,
    century: 19,
    source_ebook: "17119",
    collection_title: "The Vision of Sir Launfal and Other Poems",
  },
  whittierNature: {
    author: "John Greenleaf Whittier",
    author_slug: "john-greenleaf-whittier",
    death_year: 1892,
    century: 19,
    source_ebook: "9574",
    collection_title:
      "Poems of Nature, Poems Subjective and Reminiscent and Religious Poems, Complete",
  },
  whittierReform: {
    author: "John Greenleaf Whittier",
    author_slug: "john-greenleaf-whittier",
    death_year: 1892,
    century: 19,
    source_ebook: "9580",
    collection_title: "Anti-Slavery Poems and Songs of Labor and Reform, Complete",
  },
  poe: {
    author: "Edgar Allan Poe",
    author_slug: "edgar-allan-poe",
    death_year: 1849,
    century: 19,
    source_ebook: "10031",
    collection_title: "The Complete Poetical Works of Edgar Allan Poe",
  },
};

const EXTRACT_SPECS = [
  {
    source: SOURCES.longfellow,
    slug: "a-psalm-of-life",
    title: "A Psalm of Life",
    start: "WHAT THE HEART OF THE YOUNG MAN SAID TO THE PSALMIST.",
    end: "THE REAPER AND THE FLOWERS.",
  },
  {
    source: SOURCES.longfellow,
    slug: "excelsior",
    title: "Excelsior",
    start: "The shades of night were falling fast,",
    end: "*       *       *       *       *",
  },
  {
    source: SOURCES.longfellow,
    slug: "hiawathas-childhood",
    title: "Hiawatha's Childhood",
    start: "Downward through the evening twilight,",
    end: "HIAWATHA AND MUDJEKEEWIS",
  },
  {
    source: SOURCES.longfellow,
    slug: "paul-reveres-ride",
    title: "Paul Revere's Ride",
    start: "Listen, my children, and you shall hear",
    end: "INTERLUDE.",
  },
  {
    source: SOURCES.holmesEarly,
    slug: "the-last-leaf",
    title: "The Last Leaf",
    start: "I SAW him once before,",
    end: "THE CAMBRIDGE CHURCHYARD",
  },
  {
    source: SOURCES.holmesLate,
    slug: "the-chambered-nautilus",
    title: "The Chambered Nautilus",
    start: "THIS is the ship of pearl, which, poets feign,",
    end: "SUN AND SHADOW",
  },
  {
    source: SOURCES.holmesLate,
    slug: "contentment",
    title: "Contentment",
    start: "\"Man wants but little here below\"",
    end: "AESTIVATION",
  },
  {
    source: SOURCES.lowell,
    slug: "the-vision-of-sir-launfal",
    title: "The Vision of Sir Launfal",
    start: "Over his keys the musing organist,",
    end: "ODE RECITED AT THE HARVARD COMMEMORATION.",
  },
  {
    source: SOURCES.lowell,
    slug: "the-first-snow-fall",
    title: "The First Snow-Fall",
    start: "The snow had begun in the gloaming,",
    end: "THE OAK.",
  },
  {
    source: SOURCES.lowell,
    slug: "the-present-crisis",
    title: "The Present Crisis",
    start: "When a deed is done for Freedom, through the broad earth's aching breast",
    end: "AL FRESCO.",
  },
  {
    source: SOURCES.whittierNature,
    slug: "snow-bound-a-winter-idyl",
    title: "Snow-Bound: A Winter Idyl",
    start: "The sun that brief December day",
    end: "MY TRIUMPH.",
  },
  {
    source: SOURCES.whittierNature,
    slug: "in-school-days",
    title: "In School-Days",
    start: "Still sits the school-house by the road,",
    end: "MY BIRTHDAY.",
  },
  {
    source: SOURCES.poe,
    slug: "to-helen",
    title: "To Helen",
    start: "I saw thee once--once only--years ago:",
    end: "ANNABEL LEE.",
  },
  {
    source: SOURCES.poe,
    slug: "eldorado",
    title: "Eldorado",
    start: "Gaily bedight,",
    end: "EULALIE.",
  },
  {
    source: SOURCES.poe,
    slug: "the-city-in-the-sea",
    title: "The City in the Sea",
    start: "Lo! Death has reared himself a throne",
    end: "*       *       *       *       *",
  },
  {
    source: SOURCES.poe,
    slug: "the-sleeper",
    title: "The Sleeper",
    start: "At midnight, in the month of June,",
    end: "BRIDAL BALLAD.",
  },
  {
    source: SOURCES.poe,
    slug: "the-conqueror-worm",
    title: "The Conqueror Worm",
    start: "Lo! 'tis a gala night",
    end: "SILENCE.",
  },
  {
    source: SOURCES.poe,
    slug: "dreamland",
    title: "Dreamland",
    start: "By a route obscure and lonely,",
    end: "TO ZANTE.",
  },
];

const OLD_IRONSIDES = `AY, tear her tattered ensign down!
Long has it waved on high,
And many an eye has danced to see
That banner in the sky;
Beneath it rung the battle shout,
And burst the cannon's roar;--
The meteor of the ocean air
Shall sweep the clouds no more.

Her deck, once red with heroes' blood,
Where knelt the vanquished foe,
When winds were hurrying o'er the flood,
And waves were white below,
No more shall feel the victor's tread,
Or know the conquered knee;--
The harpies of the shore shall pluck
The eagle of the sea!

Oh, better that her shattered hulk
Should sink beneath the wave;
Her thunders shook the mighty deep,
And there should be her grave;
Nail to the mast her holy flag,
Set every threadbare sail,
And give her to the god of storms,
The lightning and the gale!`;

const ebookCache = new Map();

function normalizeText(raw) {
  return raw.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
}

function stripBoilerplate(raw) {
  const start = raw.match(/\*\*\*\s*START OF[\s\S]*?\*\*\*/i);
  const end = raw.match(/\*\*\*\s*END OF[\s\S]*?\*\*\*/i);
  const startIdx = start ? start.index + start[0].length : 0;
  const endIdx = end ? end.index : raw.length;
  return raw.slice(startIdx, endIdx).trim();
}

async function getEbookLines(ebookId) {
  if (!ebookCache.has(ebookId)) {
    const response = await fetch(
      `https://www.gutenberg.org/ebooks/${ebookId}.txt.utf-8`,
      { redirect: "follow" },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ebook ${ebookId} (${response.status})`);
    }
    const text = stripBoilerplate(normalizeText(await response.text()));
    ebookCache.set(ebookId, text.split("\n"));
  }
  return ebookCache.get(ebookId);
}

function buildMeta(source, slug, title) {
  return yaml.dump(
    {
      id: `${source.author_slug}/${slug}`,
      slug,
      author: source.author,
      author_slug: source.author_slug,
      title,
      century: source.century,
      text_in_repo: true,
      text_path: `poems/${source.author_slug}/${slug}.txt`,
      source_label: "Project Gutenberg",
      source_url: `https://www.gutenberg.org/ebooks/${source.source_ebook}`,
      public_domain_rationale: `Public domain (author died ${source.death_year}; distributed by Project Gutenberg as public-domain text).`,
      collection_title: source.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${source.source_ebook}`,
      featured: false,
    },
    { lineWidth: -1, noRefs: true, sortKeys: false },
  );
}

function extractBetween(lines, start, end) {
  const startIndex = lines.findIndex((line) => line.trim() === start);
  if (startIndex === -1) {
    throw new Error(`Start marker not found: ${start}`);
  }

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && line.trim() === end,
  );
  if (endIndex === -1) {
    throw new Error(`End marker not found after ${start}: ${end}`);
  }

  const block = lines.slice(startIndex, endIndex);
  while (block.length > 0 && block[0].trim() === "") block.shift();
  while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
  return `${block.join("\n")}\n`;
}

function extractBarbaraFrietchie(lines) {
  const poemStart = lines.findIndex(
    (line) => line.trim() === "Up from the meadows rich with corn,",
  );
  if (poemStart === -1) {
    throw new Error("Could not find Barbara Frietchie poem start");
  }

  let poemEnd = lines.length;
  for (let i = poemStart + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (
      trimmed.length >= 4 &&
      trimmed === trimmed.toUpperCase() &&
      /^[A-Z]/.test(trimmed) &&
      lines[i] === lines[i].trimStart()
    ) {
      poemEnd = i;
      break;
    }
  }

  const block = lines.slice(poemStart, poemEnd);
  while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
  return `${block.join("\n")}\n`;
}

async function writePoem(source, slug, title, poemText) {
  const poemsDir = path.join("poems", source.author_slug);
  const metaDir = path.join("meta", source.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  await fs.writeFile(path.join(poemsDir, `${slug}.txt`), poemText, "utf8");
  await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(source, slug, title), "utf8");
  console.log(`[wrote] ${source.author_slug}/${slug}`);
}

async function main() {
  for (const spec of EXTRACT_SPECS) {
    const lines = await getEbookLines(spec.source.source_ebook);
    const poemText = extractBetween(lines, spec.start, spec.end);
    await writePoem(spec.source, spec.slug, spec.title, poemText);
  }

  await writePoem(
    SOURCES.holmesEarly,
    "old-ironsides",
    "Old Ironsides",
    `${OLD_IRONSIDES}\n`,
  );

  const whittierLines = await getEbookLines(SOURCES.whittierReform.source_ebook);
  await writePoem(
    SOURCES.whittierReform,
    "barbara-frietchie",
    "Barbara Frietchie",
    extractBarbaraFrietchie(whittierLines),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
