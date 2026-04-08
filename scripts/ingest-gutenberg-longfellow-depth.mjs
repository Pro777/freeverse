import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCE = {
  author: "Henry Wadsworth Longfellow",
  author_slug: "henry-wadsworth-longfellow",
  death_year: 1882,
  century: 19,
  source_ebook: "1365",
  collection_title: "The Complete Poetical Works of Henry Wadsworth Longfellow",
};

const EXTRACT_SPECS = [
  {
    slug: "the-wreck-of-the-hesperus",
    title: "The Wreck of the Hesperus",
    start: "THE WRECK OF THE HESPERUS",
    end: "THE VILLAGE BLACKSMITH",
  },
  {
    slug: "the-village-blacksmith",
    title: "The Village Blacksmith",
    start: "THE VILLAGE BLACKSMITH",
    end: "ENDYMION",
  },
  {
    slug: "the-rainy-day",
    title: "The Rainy Day",
    start: "THE RAINY DAY",
    end: "GOD'S-ACRE.",
  },
  {
    slug: "my-lost-youth",
    title: "My Lost Youth",
    start: "MY LOST YOUTH",
    end: "THE ROPEWALK",
  },
  {
    slug: "the-childrens-hour",
    title: "The Children's Hour",
    start: "THE CHILDREN'S HOUR",
    end: "ENCELADUS",
  },
  {
    slug: "the-tide-rises-the-tide-falls",
    title: "The Tide Rises, the Tide Falls",
    start: "THE TIDE RISES, THE TIDE FALLS",
    end: "SONNETS",
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

async function getEbookText(ebookId) {
  const response = await fetch(`https://www.gutenberg.org/ebooks/${ebookId}.txt.utf-8`, {
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Gutenberg ebook ${ebookId}: ${response.status}`);
  }
  return normalizeText(stripBoilerplate(await response.text()));
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
      text_locale: "en",
      original_language: "en",
      text_direction: "ltr",
      text_path: `poems/${SOURCE.author_slug}/${spec.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`,
      public_domain_rationale:
        "Public domain in the United States: Project Gutenberg ebook sourced from pre-1929 editions and the author died in 1882.",
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

  const ebookText = await getEbookText(SOURCE.source_ebook);

  for (const spec of EXTRACT_SPECS) {
    const poem = extractPoem(ebookText, spec);
    await fs.writeFile(path.join(poemsDir, `${spec.slug}.txt`), `${poem}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${spec.slug}.yml`), buildMeta(spec), "utf8");
    console.log(`${SOURCE.author}: created ${spec.slug}`);
  }

  console.log(`Total created: ${EXTRACT_SPECS.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
