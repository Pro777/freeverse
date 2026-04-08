import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POETS = [
  {
    author: "William Blake",
    author_slug: "william-blake",
    death_year: 1827,
    century: 18,
    source_ebook: "1934",
    collection_title: "Songs of Innocence and of Experience",
    targets: [
      {
        heading: "LONDON",
        slug: "london",
        title: "London",
        published_year: 1794,
        start_line: "I wander through each chartered street,",
        end_line: "THE HUMAN ABSTRACT",
        force: true,
      },
      {
        heading: "THE SHEPHERD",
        slug: "the-shepherd",
        title: "The Shepherd",
        published_year: 1789,
        start_line: "How sweet is the shepherd’s sweet lot!",
        end_line: "THE ECHOING GREEN",
        force: true,
      },
      {
        heading: "THE ECHOING GREEN",
        slug: "the-echoing-green",
        title: "The Echoing Green",
        published_year: 1789,
        start_line: "The sun does arise,",
        end_line: "THE LAMB",
        force: true,
      },
      {
        heading: "NIGHT",
        slug: "night",
        title: "Night",
        published_year: 1789,
        start_line: "The sun descending in the West,",
        end_line: "SPRING",
        force: true,
      },
      {
        heading: "THE FLY",
        slug: "the-fly",
        title: "The Fly",
        published_year: 1794,
        start_line: "Little Fly,",
        end_line: "THE ANGEL",
        force: true,
      },
      {
        heading: "AH, SUNFLOWER",
        slug: "ah-sunflower",
        title: "Ah, Sunflower",
        published_year: 1794,
        start_line: "Ah, sunflower, weary of time,",
        end_line: "THE LILY",
        force: true,
      },
      {
        heading: "SPRING",
        slug: "spring",
        title: "Spring",
        published_year: 1789,
        start_line: "      Sound the flute!",
        end_line: "NURSE’S SONG",
        force: true,
      },
      {
        heading: "INFANT JOY",
        slug: "infant-joy",
        title: "Infant Joy",
        published_year: 1789,
        start_line: "‘I have no name;",
        end_line: "A DREAM",
        force: true,
      },
      {
        heading: "THE CLOD AND THE PEBBLE",
        slug: "the-clod-and-the-pebble",
        title: "The Clod and the Pebble",
        published_year: 1794,
        start_line: "‘Love seeketh not itself to please,",
        end_line: "HOLY THURSDAY",
        force: true,
      },
      {
        heading: "THE GARDEN OF LOVE",
        slug: "the-garden-of-love",
        title: "The Garden of Love",
        published_year: 1794,
        start_line: "I went to the Garden of Love,",
        end_line: "THE LITTLE VAGABOND",
        force: true,
      },
      {
        heading: "THE SCHOOLBOY",
        slug: "the-schoolboy",
        title: "The Schoolboy",
        published_year: 1789,
        start_line: "I love to rise in a summer morn,",
        end_line: "THE VOICE OF THE ANCIENT BARD",
        force: true,
      },
    ],
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    death_year: 1821,
    century: 19,
    source_ebook: "23684",
    collection_title: "Poems by John Keats",
    targets: [
      {
        heading: "WHEN I HAVE FEARS THAT I MAY CEASE TO BE",
        slug: "when-i-have-fears-that-i-may-cease-to-be",
        title: "When I Have Fears That I May Cease to Be",
        published_year: 1848,
      },
      { heading: "ON THE SEA", slug: "on-the-sea", title: "On the Sea", published_year: 1848 },
    ],
  },
  {
    author: "Samuel Taylor Coleridge",
    author_slug: "samuel-taylor-coleridge",
    death_year: 1834,
    century: 19,
    source_ebook: "8208",
    collection_title: "The Complete Poetical Works of Samuel Taylor Coleridge, Vol. I",
    targets: [
      {
        heading: "THE RIME OF THE ANCIENT MARINER",
        slug: "the-rime-of-the-ancient-mariner",
        title: "The Rime of the Ancient Mariner",
        published_year: 1798,
      },
      { heading: "CHRISTABEL", slug: "christabel", title: "Christabel", published_year: 1816 },
    ],
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    death_year: 1822,
    century: 19,
    source_ebook: "4800",
    collection_title: "The Complete Poetical Works of Percy Bysshe Shelley",
    targets: [
      {
        heading: "ODE TO THE WEST WIND",
        slug: "ode-to-the-west-wind",
        title: "Ode to the West Wind",
        published_year: 1820,
        start_line: "O wild West Wind, thou breath of Autumn’s being,",
        end_line: "AN EXHORTATION.",
        force: true,
      },
    ],
  },
  {
    author: "William Wordsworth",
    author_slug: "william-wordsworth",
    death_year: 1850,
    century: 19,
    source_ebook: "52836",
    collection_title: "The Poetical Works of William Wordsworth — Volume 8 (of 8)",
    targets: [
      {
        heading: "ODE. INTIMATIONS OF IMMORTALITY. With Biographical Sketch and Notes.",
        slug: "ode-intimations-of-immortality",
        title: "Ode: Intimations of Immortality",
        published_year: 1807,
        start_line: "There was a time when meadow, grove, and stream,",
        end_line: "This great _Ode_ was first printed as the last poem in the second",
        force: true,
      },
    ],
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    death_year: 1824,
    century: 19,
    source_ebook: "21811",
    collection_title: "Byron: Selected Poetry",
    targets: [
      {
        heading: "SO, WE'LL GO NO MORE A ROVING",
        slug: "so-well-go-no-more-a-roving",
        title: "So, We'll Go No More a Roving",
        published_year: 1830,
      },
      { heading: "DARKNESS", slug: "darkness", title: "Darkness", published_year: 1816 },
      {
        heading: "ON THIS DAY I COMPLETE MY THIRTY-SIXTH YEAR",
        slug: "on-this-day-i-complete-my-thirty-sixth-year",
        title: "On This Day I Complete My Thirty-Sixth Year",
        published_year: 1824,
      },
      { heading: "PROMETHEUS", slug: "prometheus", title: "Prometheus", published_year: 1816 },
    ],
  },
];

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

function key(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "");
}

function buildMeta(poet, target) {
  return yaml.dump(
    {
      id: `${poet.author_slug}/${target.slug}`,
      slug: target.slug,
      author: poet.author,
      author_slug: poet.author_slug,
      title: target.title,
      century: poet.century,
      text_path: `poems/${poet.author_slug}/${target.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: `https://www.gutenberg.org/cache/epub/${poet.source_ebook}/pg${poet.source_ebook}.txt`,
      public_domain_rationale:
        `Public domain in the United States: first published ${target.published_year} ` +
        `(pre-1929); text via Project Gutenberg eBook #${poet.source_ebook}.`,
      collection_title: poet.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${poet.source_ebook}`,
    },
    { lineWidth: 1000 },
  );
}

async function fetchLines(ebookId) {
  const response = await fetch(`https://www.gutenberg.org/ebooks/${ebookId}.txt.utf-8`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ebook ${ebookId} (${response.status})`);
  }
  return stripBoilerplate(normalizeText(await response.text())).split("\n");
}

async function ingestPoet(poet) {
  const poemsDir = path.join("poems", poet.author_slug);
  const metaDir = path.join("meta", poet.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const existingSlugs = new Set(
    (await fs.readdir(poemsDir))
      .filter((file) => file.endsWith(".txt"))
      .map((file) => file.replace(/\.txt$/, "")),
  );

  const lines = await fetchLines(poet.source_ebook);
  const headingMap = new Map(poet.targets.map((target) => [key(target.heading), target]));
  const hits = new Map();

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].trim();
    const target = headingMap.get(key(heading));
    if (target) hits.set(target.slug, { index, target });
  }

  const orderedHits = [...hits.values()].sort((a, b) => a.index - b.index);

  let created = 0;
  for (let index = 0; index < orderedHits.length; index += 1) {
    const current = orderedHits[index];
    let block;
    if (current.target.start_line && current.target.end_line) {
      const startIndex = lines.findIndex((line) => line.trim() === current.target.start_line);
      if (startIndex === -1) continue;
      const endIndex = lines.findIndex(
        (line, lineIndex) => lineIndex > startIndex && line.trim() === current.target.end_line,
      );
      if (endIndex === -1) continue;
      block = lines.slice(startIndex, endIndex);
    } else {
      const nextIndex = index + 1 < orderedHits.length ? orderedHits[index + 1].index : lines.length;
      block = lines.slice(current.index + 1, nextIndex);
    }

    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
    if (block.filter((line) => line.trim() !== "").length < 3) continue;

    if (existingSlugs.has(current.target.slug) && !current.target.force) continue;
    existingSlugs.add(current.target.slug);

    await fs.writeFile(path.join(poemsDir, `${current.target.slug}.txt`), `${block.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${current.target.slug}.yml`), buildMeta(poet, current.target), "utf8");
    created += 1;
  }

  return { created, found: orderedHits.length };
}

async function main() {
  let createdTotal = 0;

  for (const poet of POETS) {
    const result = await ingestPoet(poet);
    createdTotal += result.created;
    console.log(`${poet.author}: created ${result.created} (found ${result.found}/${poet.targets.length})`);
  }

  console.log(`Total created: ${createdTotal}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
