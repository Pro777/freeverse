import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const POEMS = [
  {
    author: "George Herbert",
    author_slug: "george-herbert",
    century: 17,
    slug: "prayer-i",
    title: "Prayer (I)",
    source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations/Prayer_(I)",
    collection_title: "The Temple: Sacred Poems and Private Ejaculations",
    collection_source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations",
    page_title: "The Temple: Sacred Poems and Private Ejaculations/Prayer (I)",
    start_line: "PRayer the Churches banquet, Angels age,",
    end_line: "The land of spices; something understood.",
  },
  {
    author: "George Herbert",
    author_slug: "george-herbert",
    century: 17,
    slug: "jordan-i",
    title: "Jordan (I)",
    source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations/Jordan_(I)",
    collection_title: "The Temple: Sacred Poems and Private Ejaculations",
    collection_source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations",
    page_title: "The Temple: Sacred Poems and Private Ejaculations/Jordan (I)",
    start_line: "WHo sayes that fictions onely and false hair",
    end_line: "Who plainly say, My God, My King.",
  },
  {
    author: "George Herbert",
    author_slug: "george-herbert",
    century: 17,
    slug: "deniall",
    title: "Deniall",
    source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations/Deniall",
    collection_title: "The Temple: Sacred Poems and Private Ejaculations",
    collection_source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations",
    page_title: "The Temple: Sacred Poems and Private Ejaculations/Deniall",
    start_line: "WHen my devotions could not pierce",
    end_line: "And mend my ryme.",
  },
  {
    author: "George Herbert",
    author_slug: "george-herbert",
    century: 17,
    slug: "affliction-i",
    title: "Affliction (I)",
    source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations/Affliction_(I)",
    collection_title: "The Temple: Sacred Poems and Private Ejaculations",
    collection_source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations",
    page_title: "The Temple: Sacred Poems and Private Ejaculations/Affliction (I)",
    start_line: "WHen first thou didst entice to thee my heart,",
    end_line: "Let me not love thee, if I love thee not.",
  },
  {
    author: "George Herbert",
    author_slug: "george-herbert",
    century: 17,
    slug: "vertue",
    title: "Vertue",
    source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations/Vertue",
    collection_title: "The Temple: Sacred Poems and Private Ejaculations",
    collection_source_url: "https://en.wikisource.org/wiki/The_Temple:_Sacred_Poems_and_Private_Ejaculations",
    page_title: "The Temple: Sacred Poems and Private Ejaculations/Vertue",
    start_line: "SWeet day, so cool, so calm, so bright,",
    end_line: "Then chiefly lives.",
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
    .filter((line) => line.trim() !== "¶ Prayer." && line.trim() !== "¶ Jordan." && line.trim() !== "¶ Deniall." && line.trim() !== "¶ Affliction." && line.trim() !== "¶ Vertue.")
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
        "Public domain in the United States: Herbert died 1633 and the Wikisource text is from a public-domain source.",
      collection_title: poem.collection_title,
      collection_source_url: poem.collection_source_url,
      notes: "Orthography preserved from the 1633 text on Wikisource.",
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
