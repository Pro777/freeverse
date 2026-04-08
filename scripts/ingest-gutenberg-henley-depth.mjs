import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const SOURCE = {
  author: "William Ernest Henley",
  author_slug: "william-ernest-henley",
  century: 19,
  source_ebook: "1568",
  collection_title: "Poems",
};

const POEMS = [
  {
    slug: "the-sea-is-full-of-wandering-foam",
    title: "The Sea Is Full of Wandering Foam",
    published_year: 1876,
    start_line: "THE sea is full of wandering foam,",
    end_line: "O, dark and loud’s the night!",
  },
  {
    slug: "while-the-west-is-paling",
    title: "While the West Is Paling",
    published_year: 1876,
    start_line: "WHILE the west is paling",
    end_line: "Sun and stars to me.",
  },
  {
    slug: "the-skies-are-strown-with-stars",
    title: "The Skies Are Strown with Stars",
    published_year: 1877,
    start_line: "THE skies are strown with stars,",
    end_line: "And life is not in vain.",
  },
  {
    slug: "a-late-lark-twitters-from-the-quiet-skies",
    title: "A Late Lark Twitters from the Quiet Skies",
    published_year: 1886,
    start_line: "A LATE lark twitters from the quiet skies;",
    end_line: "Death.",
  },
  {
    slug: "or-ever-the-knightly-years-were-gone",
    title: "Or Ever the Knightly Years Were Gone",
    published_year: 1876,
    start_line: "OR ever the knightly years were gone",
    end_line: "And you were a Virgin Slave.",
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
  const sourceUrl = `https://www.gutenberg.org/cache/epub/${SOURCE.source_ebook}/pg${SOURCE.source_ebook}.txt`;
  return yaml.dump(
    {
      id: `${SOURCE.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: SOURCE.author,
      author_slug: SOURCE.author_slug,
      title: poem.title,
      century: SOURCE.century,
      text_path: `poems/${SOURCE.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: sourceUrl,
      public_domain_rationale:
        `Public domain in the United States: first published ${poem.published_year} ` +
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

  const lines = await fetchLines(SOURCE.source_ebook);
  let created = 0;

  for (const poem of POEMS) {
    const text = extractPoem(lines, poem.start_line, poem.end_line);
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
    console.log(`${SOURCE.author}: ${existed ? "updated" : "created"} ${poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
