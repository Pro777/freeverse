import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCE = {
  author: "Robert Frost",
  author_slug: "robert-frost",
  century: 20,
  source_ebook: "58611",
  collection_title: "New Hampshire",
};

const EXTRACT_SPECS = [
  {
    slug: "fire-and-ice",
    title: "Fire and Ice",
    published_year: 1923,
    start: "Some say the world will end in fire,",
    end: "IN A DISUSED GRAVEYARD",
  },
  {
    slug: "dust-of-snow",
    title: "Dust of Snow",
    published_year: 1923,
    start: "The way a crow",
    end: "TO E. T.",
  },
  {
    slug: "nothing-gold-can-stay",
    title: "Nothing Gold Can Stay",
    published_year: 1923,
    start: "Nature's first green is gold,",
    end: "THE RUNAWAY",
  },
  {
    slug: "stopping-by-woods-on-a-snowy-evening",
    title: "Stopping by Woods on a Snowy Evening",
    published_year: 1923,
    start: "Whose woods these are I think I know.",
    end: "FOR ONCE, THEN, SOMETHING",
  },
  {
    slug: "the-need-of-being-versed-in-country-things",
    title: "The Need of Being Versed in Country Things",
    published_year: 1923,
    start: "_The house had gone to bring again",
    end: "FOOTNOTES",
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

  const fromStart = text.slice(startIndex);
  const endIndex = fromStart.indexOf(end);
  if (endIndex === -1) throw new Error(`End marker not found for ${title}`);

  return fromStart
    .slice(0, endIndex)
    .replace(/^[ \t]*_+/gm, "")
    .replace(/_+[ \t]*$/gm, "")
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
        `(pre-1931); text via Project Gutenberg eBook #${SOURCE.source_ebook}.`,
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

  const response = await fetch(`https://www.gutenberg.org/cache/epub/${SOURCE.source_ebook}/pg${SOURCE.source_ebook}.txt`);
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
