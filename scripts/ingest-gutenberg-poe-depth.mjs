import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCE = {
  author: "Edgar Allan Poe",
  author_slug: "edgar-allan-poe",
  century: 19,
  source_ebook: "10031",
  collection_title: "The Raven and Other Poems",
};

const EXTRACT_SPECS = [
  {
    slug: "ulalume",
    title: "Ulalume",
    published_year: 1847,
    start: "ULALUME.",
    end: "TO HELEN.",
  },
  {
    slug: "to-one-in-paradise",
    title: "To One in Paradise",
    published_year: 1834,
    start: "TO ONE IN PARADISE,",
    end: "THE COLISEUM.",
  },
  {
    slug: "the-haunted-palace",
    title: "The Haunted Palace",
    published_year: 1839,
    start: "THE HAUNTED PALACE.",
    end: "THE CONQUEROR WORM.",
  },
  {
    slug: "the-valley-of-unrest",
    title: "The Valley of Unrest",
    published_year: 1831,
    start: "THE VALLEY OF UNREST.",
    end: "ISRAFEL. [1]",
  },
  {
    slug: "to-zante",
    title: "To Zante",
    published_year: 1837,
    start: "TO ZANTE.",
    end: "HYMN.",
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

function extractPoem(text, { start, end, title }) {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) throw new Error(`Start marker not found for ${title}`);

  const fromStart = text.slice(startIndex + start.length).trimStart();
  const endIndex = fromStart.indexOf(end);
  if (endIndex === -1) throw new Error(`End marker not found for ${title}`);

  return fromStart
    .slice(0, endIndex)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildMeta(spec) {
  return yaml.dump(
    {
      id: `${SOURCE.author_slug}/${spec.slug}`,
      slug: spec.slug,
      author: SOURCE.author,
      author_slug: SOURCE.author_slug,
      title: spec.title,
      century: SOURCE.century,
      text_path: `poems/${SOURCE.author_slug}/${spec.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`,
      public_domain_rationale:
        `Public domain in the United States: first published ${spec.published_year} ` +
        `(pre-1929); text via Project Gutenberg eBook #${SOURCE.source_ebook}.`,
      collection_title: SOURCE.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`,
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  const poemsDir = path.join("poems", SOURCE.author_slug);
  const metaDir = path.join("meta", SOURCE.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const response = await fetch(`https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}.txt.utf-8`, {
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Gutenberg ebook ${SOURCE.source_ebook}: ${response.status}`);
  }
  const ebookText = normalizeText(stripBoilerplate(await response.text()));

  for (const spec of EXTRACT_SPECS) {
    const poem = extractPoem(ebookText, spec);
    const poemPath = path.join(poemsDir, `${spec.slug}.txt`);
    const metaPath = path.join(metaDir, `${spec.slug}.yml`);

    await fs.writeFile(poemPath, `${poem}\n`, "utf8");
    await fs.writeFile(metaPath, buildMeta(spec), "utf8");
    console.log(`${SOURCE.author}: created ${spec.slug}`);
  }

  console.log(`Total created: ${EXTRACT_SPECS.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
