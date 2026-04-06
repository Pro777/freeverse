import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const SOURCES = {
  browning: {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    source_ebook: "4253",
    collection_title: "Dramatic Romances",
  },
  lazarus1: {
    author: "Emma Lazarus",
    author_slug: "emma-lazarus",
    century: 19,
    source_ebook: "3295",
    collection_title: "The Poems of Emma Lazarus, Volume 1",
  },
  lazarus2: {
    author: "Emma Lazarus",
    author_slug: "emma-lazarus",
    century: 19,
    source_ebook: "3473",
    collection_title: "The Poems of Emma Lazarus, Volume 2",
  },
};

const POEMS = [
  {
    source: SOURCES.browning,
    slug: "porphyrias-lover",
    title: "Porphyria's Lover",
    published_year: 1836,
    start_line: "The rain set early in to-night,",
    end_line: "And yet God has not said a word!",
  },
  {
    source: SOURCES.lazarus1,
    slug: "long-island-sound",
    title: "Long Island Sound",
    published_year: 1889,
    start_line: "I see it as it looked one afternoon",
    end_line: "All these fair sounds and sights I made my own.",
  },
  {
    source: SOURCES.lazarus2,
    slug: "the-crowing-of-the-red-cock",
    title: "The Crowing of the Red Cock",
    published_year: 1889,
    start_line: "Across the Eastern sky has glowed",
    end_line: "His nobler task is--to forget.",
  },
  {
    source: SOURCES.lazarus2,
    slug: "the-banner-of-the-jew",
    title: "The Banner of the Jew",
    published_year: 1889,
    start_line: "Wake, Israel, wake!  Recall to-day",
    end_line: "Strike! for the brave revere the brave!",
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
        `Public domain in the United States: first published ${poem.published_year} ` +
        `(pre-1929); text via Project Gutenberg eBook #${source.source_ebook}.`,
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
