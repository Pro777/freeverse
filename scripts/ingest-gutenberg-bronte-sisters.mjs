import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const EBOOK_ID = "1019";
const SOURCE_URL = `https://www.gutenberg.org/ebooks/${EBOOK_ID}`;
const EBOOK_TEXT_URL = `https://www.gutenberg.org/ebooks/${EBOOK_ID}.txt.utf-8`;
const COLLECTION_TITLE = "Poems by Currer, Ellis, and Acton Bell";

const SECTIONS = [
  {
    heading: "POEMS BY CURRER BELL",
    nextHeading: "POEMS BY ELLIS BELL",
    author: "Charlotte Bronte",
    author_slug: "charlotte-bronte",
    death_year: 1855,
    century: 19,
    ignoreTitles: new Set([
      "I. THE GARDEN.",
      "II. THE PARLOUR.",
      "III. THE WELCOME HOME.",
    ]),
  },
  {
    heading: "POEMS BY ELLIS BELL",
    nextHeading: "POEMS BY ACTON BELL,",
    author: "Emily Bronte",
    author_slug: "emily-bronte",
    death_year: 1848,
    century: 19,
    ignoreTitles: new Set(["A FRAGMENT."]),
  },
  {
    heading: "POEMS BY ACTON BELL,",
    nextHeading: "SELECTIONS FROM POEMS BY ELLIS BELL.",
    author: "Anne Bronte",
    author_slug: "anne-bronte",
    death_year: 1849,
    century: 19,
    ignoreTitles: new Set(["SELECTIONS FROM THE LITERARY REMAINS OF ELLIS AND ACTON BELL."]),
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

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prettifyTitle(value) {
  const cleaned = value.trim().replace(/[.,]+$/, "");
  const lowered = cleaned.toLowerCase();
  return lowered.replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
}

function isTitleLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length >= 80) return false;
  if (!/[A-Z]/.test(trimmed)) return false;
  return trimmed === trimmed.toUpperCase();
}

function findLine(lines, needle, startIndex = 0) {
  for (let i = startIndex; i < lines.length; i += 1) {
    if (lines[i].trim() === needle) return i;
  }
  throw new Error(`Could not find line: ${needle}`);
}

function findPoemStarts(lines, startIndex, endIndex, ignoreTitles) {
  const starts = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    const line = lines[i].trim();
    if (!isTitleLine(line) || ignoreTitles.has(line)) continue;

    const nextLine = lines[i + 1]?.trim() ?? "";
    if (nextLine && !/^[A-Za-z"'(]/.test(nextLine)) continue;

    starts.push({ index: i, rawTitle: line });
  }
  return starts;
}

function extractPoem(lines, titleIndex, nextTitleIndex) {
  let start = titleIndex + 1;
  while (start < nextTitleIndex && lines[start].trim() === "") start += 1;
  let end = nextTitleIndex;
  while (end > start && lines[end - 1].trim() === "") end -= 1;
  return `${lines.slice(start, end).join("\n").trim()}\n`;
}

function buildMeta(section, slug, title) {
  return yaml.dump({
    id: `${section.author_slug}/${slug}`,
    slug,
    author: section.author,
    author_slug: section.author_slug,
    title,
    century: section.century,
    text_in_repo: true,
    text_path: `poems/${section.author_slug}/${slug}.txt`,
    source_label: "Project Gutenberg",
    source_url: SOURCE_URL,
    public_domain_rationale: `Public domain (author died ${section.death_year}; distributed by Project Gutenberg as public-domain text).`,
    collection_title: COLLECTION_TITLE,
    collection_source_url: SOURCE_URL,
    featured: false,
  });
}

async function main() {
  const response = await fetch(EBOOK_TEXT_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ebook ${EBOOK_ID} (${response.status})`);
  }

  const text = stripBoilerplate(normalizeText(await response.text()));
  const lines = text.split("\n");

  for (const section of SECTIONS) {
    const startIndex = findLine(lines, section.heading);
    const endIndex = findLine(lines, section.nextHeading, startIndex + 1);
    const titleStarts = findPoemStarts(lines, startIndex + 1, endIndex, section.ignoreTitles);

    const poemsDir = path.join("poems", section.author_slug);
    const metaDir = path.join("meta", section.author_slug);
    await fs.mkdir(poemsDir, { recursive: true });
    await fs.mkdir(metaDir, { recursive: true });

    for (let i = 0; i < titleStarts.length; i += 1) {
      const current = titleStarts[i];
      const nextIndex = i + 1 < titleStarts.length ? titleStarts[i + 1].index : endIndex;
      const title = prettifyTitle(current.rawTitle);
      const slug = slugify(title);
      const poemText = extractPoem(lines, current.index, nextIndex);
      await fs.writeFile(path.join(poemsDir, `${slug}.txt`), poemText, "utf8");
      await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(section, slug, title), "utf8");
      console.log(`wrote ${section.author_slug}/${slug}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
