import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const SOURCE = {
  author: "James Russell Lowell",
  author_slug: "james-russell-lowell",
  death_year: 1891,
  century: 19,
  source_ebook: "17119",
  collection_title: "The Vision of Sir Launfal and Other Poems",
};

const POEMS = [
  {
    slug: "the-oak",
    title: "The Oak",
    start: "What gnarled stretch, what depth of shade, is his!",
    end: "PROMETHEUS.",
  },
  {
    slug: "prometheus",
    title: "Prometheus",
    start: "One after one the stars have risen and set,",
    end: "TO W.L. GARRISON.",
  },
  {
    slug: "the-nightingale-in-the-study",
    title: "The Nightingale in the Study",
    start: "\"Come forth!\" my catbird calls to me,",
    end: "ALADDIN.",
  },
  {
    slug: "beaver-brook",
    title: "Beaver Brook",
    start: "Hushed with broad sunlight lies the hill,",
    end: "THE SHEPHERD OF KING ADMETUS.",
  },
  {
    slug: "al-fresco",
    title: "Al Fresco",
    start: "The dandelions and buttercups",
    end: "THE FOOT-PATH.",
  },
];

let ebookLines;

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

async function getEbookLines() {
  if (!ebookLines) {
    const { stdout } = await execFileAsync(
      "curl",
      ["-L", "--fail", "--silent", `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}.txt.utf-8`],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    const text = stripBoilerplate(normalizeText(stdout));
    ebookLines = text.split("\n");
  }
  return ebookLines;
}

function extractBetween(lines, start, end) {
  const startIndex = lines.findIndex((line) => line.trim() === start);
  if (startIndex === -1) {
    throw new Error(`Start marker not found: ${start}`);
  }

  const endIndex = lines.findIndex((line, index) => index > startIndex && line.trim() === end);
  if (endIndex === -1) {
    throw new Error(`End marker not found after ${start}: ${end}`);
  }

  const block = lines.slice(startIndex, endIndex);
  while (block.length > 0 && block[0].trim() === "") block.shift();
  while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
  return `${block.join("\n")}\n`;
}

function buildMeta(slug, title) {
  return yaml.dump(
    {
      id: `${SOURCE.author_slug}/${slug}`,
      slug,
      author: SOURCE.author,
      author_slug: SOURCE.author_slug,
      title,
      century: SOURCE.century,
      text_in_repo: true,
      text_path: `poems/${SOURCE.author_slug}/${slug}.txt`,
      source_label: "Project Gutenberg",
      source_url: `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`,
      public_domain_rationale: `Public domain (author died ${SOURCE.death_year}; distributed by Project Gutenberg as public-domain text).`,
      collection_title: SOURCE.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`,
      featured: false,
    },
    { lineWidth: -1, noRefs: true, sortKeys: false },
  );
}

async function writePoem(slug, title, poemText) {
  const poemsDir = path.join("poems", SOURCE.author_slug);
  const metaDir = path.join("meta", SOURCE.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  await fs.writeFile(path.join(poemsDir, `${slug}.txt`), poemText, "utf8");
  await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(slug, title), "utf8");
  console.log(`[wrote] ${SOURCE.author_slug}/${slug}`);
}

async function main() {
  const lines = await getEbookLines();
  for (const poem of POEMS) {
    await writePoem(poem.slug, poem.title, extractBetween(lines, poem.start, poem.end));
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
