import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const SOURCES = {
  volume1: {
    author: "Oliver Wendell Holmes, Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    century: 19,
    source_ebook: "7388",
    collection_title: "The Poetical Works of Oliver Wendell Holmes — Volume 01: Earlier Poems",
    public_domain_note:
      "included in The Poetical Works of Oliver Wendell Holmes — Volume 01: Earlier Poems (1830-1836)",
  },
  volume6: {
    author: "Oliver Wendell Holmes, Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    century: 19,
    source_ebook: "7393",
    collection_title: "The Poetical Works of Oliver Wendell Holmes — Volume 06",
    public_domain_note: "included in The Poetical Works of Oliver Wendell Holmes — Volume 06",
  },
};

const POEMS = [
  {
    source: SOURCES.volume1,
    slug: "the-cambridge-churchyard",
    title: "The Cambridge Churchyard",
    start_line: "OUR ancient church! its lowly tower,",
    end_line: "Might call a tear on mine.",
  },
  {
    source: SOURCES.volume1,
    slug: "to-an-insect",
    title: "To an Insect",
    start_line: "I LOVE to hear thine earnest voice,",
    end_line: "Shall hear what Katy did.",
  },
  {
    source: SOURCES.volume1,
    slug: "the-height-of-the-ridiculous",
    title: "The Height of the Ridiculous",
    start_line: "I WROTE some lines once on a time",
    end_line: "As funny as I can.",
  },
  {
    source: SOURCES.volume6,
    slug: "sun-and-shadow",
    title: "Sun and Shadow",
    start_line: "As I look from the isle, o'er its billows of green,",
    end_line: "Nor ask how we look from the shore!",
  },
  {
    source: SOURCES.volume6,
    slug: "under-the-violets",
    title: "Under the Violets",
    start_line: "HER hands are cold; her face is white;",
    end_line: "Lies withered where the violets blow.",
  },
];

function normalizeText(raw) {
  return raw.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
}

function normalizeLineForMatch(line) {
  return line.replace(/\s+\d+\s*$/, "").trim();
}

function stripBoilerplate(raw) {
  const start = raw.match(/\*\*\*\s*START OF[\s\S]*?\*\*\*/i);
  const end = raw.match(/\*\*\*\s*END OF[\s\S]*?\*\*\*/i);
  const startIdx = start ? start.index + start[0].length : 0;
  const endIdx = end ? end.index : raw.length;
  return raw.slice(startIdx, endIdx).trim();
}

async function fetchLines(ebookId) {
  const url = `https://www.gutenberg.org/cache/epub/${ebookId}/pg${ebookId}.txt`;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync("curl", ["-L", "--fail", "--silent", url], {
        maxBuffer: 10 * 1024 * 1024,
      });
      return stripBoilerplate(normalizeText(stdout)).split("\n");
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
}

function extractPoem(lines, startLine, endLine) {
  const start = lines.findIndex((line) => normalizeLineForMatch(line) === startLine);
  if (start === -1) throw new Error(`Start line not found: ${startLine}`);

  const end = lines.findIndex(
    (line, index) => index >= start && normalizeLineForMatch(line) === endLine,
  );
  if (end === -1) throw new Error(`End line not found: ${endLine}`);

  return lines
    .slice(start, end + 1)
    .map((line) => line.replace(/\s+\d+\s*$/, ""))
    .join("\n")
    .trim();
}

function buildMeta(poem) {
  const source = poem.source;
  const sourceUrl = `https://www.gutenberg.org/cache/epub/${source.source_ebook}/pg${source.source_ebook}.txt`;
  return yaml.dump(
    {
      id: `${source.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: source.author,
      author_slug: source.author_slug,
      title: poem.title,
      century: source.century,
      text_path: `poems/${source.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: sourceUrl,
      public_domain_rationale:
        `Public domain in the United States: ${source.public_domain_note}; ` +
        `text via Project Gutenberg eBook #${source.source_ebook}.`,
      collection_title: source.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${source.source_ebook}`,
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  const cache = new Map();
  let created = 0;

  for (const poem of POEMS) {
    const source = poem.source;
    const poemsDir = path.join("poems", source.author_slug);
    const metaDir = path.join("meta", source.author_slug);
    await fs.mkdir(poemsDir, { recursive: true });
    await fs.mkdir(metaDir, { recursive: true });

    if (!cache.has(source.source_ebook)) {
      cache.set(source.source_ebook, await fetchLines(source.source_ebook));
    }

    const text = extractPoem(cache.get(source.source_ebook), poem.start_line, poem.end_line);
    const poemPath = path.join(poemsDir, `${poem.slug}.txt`);
    const metaPath = path.join(metaDir, `${poem.slug}.yml`);

    let existed = true;
    try {
      await fs.access(poemPath);
    } catch {
      existed = false;
    }

    await fs.writeFile(poemPath, `${text}\n`, "utf8");
    await fs.writeFile(metaPath, buildMeta(poem), "utf8");
    created += 1;
    console.log(`${source.author}: ${existed ? "updated" : "created"} ${poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
