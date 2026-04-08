import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCE = {
  author: "Walt Whitman",
  author_slug: "walt-whitman",
  century: 19,
  source_ebook: "1322",
  collection_title: "Leaves of Grass",
};

const EXTRACT_SPECS = [
  {
    slug: "i-sit-and-look-out",
    title: "I Sit and Look Out",
    start: "I Sit and Look Out",
    end: "To Rich Givers",
  },
  {
    slug: "the-dalliance-of-the-eagles",
    title: "The Dalliance of the Eagles",
    start: "The Dalliance of the Eagles",
    end: "Roaming in Thought [After reading Hegel]",
  },
  {
    slug: "there-was-a-child-went-forth",
    title: "There Was a Child Went Forth",
    start: "There Was a Child Went Forth",
    end: "Old Ireland",
  },
  {
    slug: "this-compost",
    title: "This Compost",
    start: "This Compost",
    end: "To a Foil’d European Revolutionaire",
  },
  {
    slug: "a-clear-midnight",
    title: "A Clear Midnight",
    start: "A Clear Midnight",
    end: "As the Time Draws Nigh",
  },
  {
    slug: "when-i-read-the-book",
    title: "When I Read the Book",
    start: "When I Read the Book",
    end: "Beginning My Studies",
  },
  {
    slug: "to-a-stranger",
    title: "To a Stranger",
    start: "To a Stranger",
    end: "This Moment Yearning and Thoughtful",
  },
  {
    slug: "o-you-whom-i-often-and-silently-come",
    title: "O You Whom I Often and Silently Come",
    start: "O You Whom I Often and Silently Come",
    end: "That Shadow My Likeness",
  },
  {
    slug: "i-hear-it-was-charged-against-me",
    title: "I Hear It Was Charged Against Me",
    start: "I Hear It Was Charged Against Me",
    end: "The Prairie-Grass Dividing",
  },
  {
    slug: "miracles",
    title: "Miracles",
    start: "Miracles",
    end: "Sparkles from the Wheel",
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
        "Public domain in the United States: Project Gutenberg ebook sourced from pre-1929 editions and the author died in 1892.",
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
