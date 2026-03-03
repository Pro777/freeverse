import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_TEXT_URL = "https://www.gutenberg.org/cache/epub/1041/pg1041.txt";
const SOURCE_URL = "https://www.gutenberg.org/ebooks/1041";
const AUTHOR = "William Shakespeare";
const AUTHOR_SLUG = "william-shakespeare";
const COLLECTION_TITLE = "Shakespeare's Sonnets";

function normalizeText(raw) {
  return raw.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
}

function stripGutenbergBoilerplate(raw) {
  const startMatch = raw.match(/\*\*\*\s*START OF[\s\S]*?\*\*\*/i);
  const endMatch = raw.match(/\*\*\*\s*END OF[\s\S]*?\*\*\*/i);
  const start = startMatch ? startMatch.index + startMatch[0].length : 0;
  const end = endMatch ? endMatch.index : raw.length;
  return raw.slice(start, end).trim();
}

function isSonnetHeader(line) {
  return /^\s*(?:\d{1,3}|[IVXLCDM]+)\.?\s*$/i.test(line);
}

function parseSonnets(body) {
  const lines = body.split("\n");
  const sonnets = [];
  let current = [];
  let inSonnets = false;

  for (const line of lines) {
    if (isSonnetHeader(line)) {
      if (current.length > 0) {
        sonnets.push(trimPoemLines(current));
      }
      current = [];
      inSonnets = true;
      continue;
    }
    if (inSonnets) {
      current.push(line);
    }
  }

  if (current.length > 0) {
    sonnets.push(trimPoemLines(current));
  }
  return sonnets.filter((poem) => poem.length > 0);
}

function trimPoemLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start] === "") start += 1;
  while (end > start && lines[end - 1] === "") end -= 1;
  return lines.slice(start, end);
}

function buildMeta(index) {
  const num = String(index).padStart(3, "0");
  const slug = `sonnet-${num}`;
  const title = `Sonnet ${index}`;
  return [
    `id: "${AUTHOR_SLUG}/${slug}"`,
    `slug: "${slug}"`,
    `author: "${AUTHOR}"`,
    `author_slug: "${AUTHOR_SLUG}"`,
    `title: "${title}"`,
    "century: 16",
    "text_in_repo: true",
    `text_path: "poems/${AUTHOR_SLUG}/${slug}.txt"`,
    'source_label: "Project Gutenberg"',
    `source_url: "${SOURCE_URL}"`,
    'public_domain_rationale: "Public domain (author died 1616; distributed by Project Gutenberg as public-domain text)."',
    `collection_title: "${COLLECTION_TITLE}"`,
    `collection_source_url: "${SOURCE_URL}"`,
    "featured: false",
    "",
  ].join("\n");
}

async function main() {
  const textUrl = process.argv[2] || DEFAULT_TEXT_URL;
  const poemsDir = path.join("poems", AUTHOR_SLUG);
  const metaDir = path.join("meta", AUTHOR_SLUG);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const response = await fetch(textUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Gutenberg text (${response.status})`);
  }

  const raw = normalizeText(await response.text());
  const body = stripGutenbergBoilerplate(raw);
  const sonnets = parseSonnets(body);
  if (sonnets.length !== 154) {
    throw new Error(`Expected 154 sonnets, found ${sonnets.length}`);
  }

  for (let i = 0; i < sonnets.length; i += 1) {
    const n = i + 1;
    const num = String(n).padStart(3, "0");
    const slug = `sonnet-${num}`;
    const poemPath = path.join(poemsDir, `${slug}.txt`);
    const metaPath = path.join(metaDir, `${slug}.yml`);
    const poemText = `${sonnets[i].join("\n")}\n`;
    await fs.writeFile(poemPath, poemText, "utf8");
    await fs.writeFile(metaPath, buildMeta(n), "utf8");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
