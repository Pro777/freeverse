import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const POEMS = [
  {
    author: "John Donne",
    author_slug: "john-donne",
    century: 17,
    slug: "the-flea",
    title: "The Flea",
    source_url: "https://en.wikisource.org/wiki/Poems_of_John_Donne/Volume_1/The_Flea",
    collection_title: "Poems of John Donne, Volume 1",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_John_Donne/Volume_1",
    page_title: "Poems of John Donne/Volume 1/The Flea",
    start_line: "Mark but this flea, and mark in this,",
    end_line: "Will waste, as this flea’s death took life from thee.",
  },
  {
    author: "John Donne",
    author_slug: "john-donne",
    century: 17,
    slug: "the-bait",
    title: "The Bait",
    source_url: "https://en.wikisource.org/wiki/The_Bait",
    collection_title: "Wikisource",
    collection_source_url: "https://en.wikisource.org/wiki/Author:John_Donne",
    page_title: "The Bait",
    start_line: "COME live with me, and be my love,",
    end_line: "Alas! is wiser far than I.",
  },
  {
    author: "John Donne",
    author_slug: "john-donne",
    century: 17,
    slug: "the-expiration",
    title: "The Expiration",
    source_url: "https://en.wikisource.org/wiki/The_Expiration",
    collection_title: "Wikisource",
    collection_source_url: "https://en.wikisource.org/wiki/Author:John_Donne",
    page_title: "The Expiration",
    start_line: "SO, so, break off this last lamenting kiss,",
    end_line: "Being double dead, going, and bidding, \"Go.\"",
  },
  {
    author: "John Donne",
    author_slug: "john-donne",
    century: 17,
    slug: "the-undertaking",
    title: "The Undertaking",
    source_url: "https://en.wikisource.org/wiki/The_Undertaking",
    collection_title: "Wikisource",
    collection_source_url: "https://en.wikisource.org/wiki/Author:John_Donne",
    page_title: "The Undertaking",
    start_line: "I HAVE done one braver thing",
    end_line: "Which is, to keep that hid.",
  },
  {
    author: "John Donne",
    author_slug: "john-donne",
    century: 17,
    slug: "song-go-and-catch-a-falling-star",
    title: "Song: Go and Catch a Falling Star",
    source_url: "https://en.wikisource.org/wiki/Oxford_Book_of_English_Verse_1250-1900/Song_(Donne)",
    collection_title: "Oxford Book of English Verse 1250-1900",
    collection_source_url: "https://en.wikisource.org/wiki/Oxford_Book_of_English_Verse_1250-1900",
    page_title: "Oxford Book of English Verse 1250-1900/Song (Donne)",
    start_line: "GO and catch a falling star,",
    end_line: "False, ere I come, to two or three.",
  },
];

function decodeHtml(value) {
  return value
    .replace(/&#32;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&#8195;/g, "    ")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#160;/g, " ")
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/&#95;/g, "_")
    .replace(/&#8203;/g, "")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…");
}

function cleanRenderedText(html) {
  let body = html.includes('<div class="prp-pages-output"')
    ? html.slice(html.indexOf('<div class="prp-pages-output"'))
    : html;
  const referencesIndex = body.indexOf('<div class="mw-references-wrap');
  if (referencesIndex !== -1) body = body.slice(0, referencesIndex);

  body = body.replace(/<style[\s\S]*?<\/style>/g, "");
  body = body.replace(/<link[^>]*>/g, "");
  body = body.replace(/<sup[^>]*>.*?<\/sup>/gs, "");
  body = body.replace(/<span[^>]*class="pagenum[\s\S]*?<\/span><\/span>/g, "");
  body = body.replace(/<span[^>]*class="wst-gap[^"]*"[^>]*><\/span>/g, "    ");
  body = body.replace(/<br\s*\/?>\n?/g, "\n");
  body = body.replace(/<\/p>\s*<p>/g, "\n\n");
  body = body.replace(/<[^>]+>/g, "");

  return decodeHtml(body)
    .replace(/\u00a0/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractPoem(text, startLine, endLine) {
  const lines = text.split("\n").map((line) => line.trimEnd());
  const start = lines.findIndex((line) => line.trim() === startLine);
  if (start === -1) throw new Error(`Start line not found: ${startLine}`);

  const end = lines.findIndex((line, index) => index >= start && line.trim() === endLine);
  if (end === -1) throw new Error(`End line not found: ${endLine}`);

  return lines
    .slice(start, end + 1)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPoemText(pageTitle, startLine, endLine) {
  const url =
    "https://en.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync("curl", ["-L", "--fail", "--silent", url], {
        maxBuffer: 10 * 1024 * 1024,
      });
      const json = JSON.parse(stdout);
      if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
      return extractPoem(cleanRenderedText(json.parse.text), startLine, endLine);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

function buildMeta(poem) {
  return yaml.dump(
    {
      id: `${poem.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: poem.author,
      author_slug: poem.author_slug,
      title: poem.title,
      century: poem.century,
      text_path: `poems/${poem.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Wikisource",
      source_url: poem.source_url,
      public_domain_rationale:
        "Public domain in the United States: Donne died 1631 and the Wikisource text is from a public-domain source.",
      collection_title: poem.collection_title,
      collection_source_url: poem.collection_source_url,
      notes: "Orthography and capitalization preserved from Wikisource.",
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  let created = 0;

  for (const poem of POEMS) {
    const poemsDir = path.join("poems", poem.author_slug);
    const metaDir = path.join("meta", poem.author_slug);
    await fs.mkdir(poemsDir, { recursive: true });
    await fs.mkdir(metaDir, { recursive: true });

    const text = await fetchPoemText(poem.page_title, poem.start_line, poem.end_line);
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
    console.log(`${poem.author}: ${existed ? "updated" : "created"} ${poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
