import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const COLLECTION_TITLE = "Poems (Tennyson, 1843)";
const COLLECTION_SOURCE_URL = "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)";

const POEMS = [
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    century: 19,
    slug: "mariana-in-the-south",
    title: "Mariana in the South",
    published_year: 1843,
    source_url: "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)/Volume_1/Mariana_in_the_South",
    page_title: "Poems (Tennyson, 1843)/Volume 1/Mariana in the South",
    start_line: "With one black shadow at its feet,",
    end_line: 'To live forgotten, and love forlorn."',
  },
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    century: 19,
    slug: "the-palace-of-art",
    title: "The Palace of Art",
    published_year: 1843,
    source_url: "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)/Volume_1/The_Palace_of_Art",
    page_title: "Poems (Tennyson, 1843)/Volume 1/The Palace of Art",
    start_line: "I built my soul a lordly pleasure-house,",
    end_line: 'When I have purged my guilt."',
  },
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    century: 19,
    slug: "morte-darthur",
    title: "Morte d’Arthur",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)/Volume_2/Morte_d%27Arthur",
    page_title: "Poems (Tennyson, 1843)/Volume 2/Morte d'Arthur",
    start_line: "So all day long the noise of battle roll'd",
    end_line: "The clear church-bells ring in the Christmas morn.",
  },
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    century: 19,
    slug: "locksley-hall",
    title: "Locksley Hall",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)/Volume_2/Locksley_Hall",
    page_title: "Poems (Tennyson, 1843)/Volume 2/Locksley Hall",
    start_line: "Comrades, leave me here a little, while as yet 'tis early morn:",
    end_line: "For the mighty wind arises, roaring seaward, and I go.",
  },
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    century: 19,
    slug: "lady-clare",
    title: "Lady Clare",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Poems_(Tennyson,_1843)/Volume_2/Lady_Clare",
    page_title: "Poems (Tennyson, 1843)/Volume 2/Lady Clare",
    start_line: "Lord Ronald courted Lady Clare,",
    end_line: 'And you shall still be Lady Clare."',
  },
];

function decodeHtml(value) {
  return value
    .replace(/&#32;/g, " ")
    .replace(/&#39;/g, "'")
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
    .replace(/&#8230;/g, "…")
    .replace(/&#198;/g, "Æ")
    .replace(/&#230;/g, "æ")
    .replace(/&#339;/g, "œ")
    .replace(/&#42;/g, "*");
}

function cleanRenderedText(html) {
  let body = html.slice(html.indexOf('<div class="prp-pages-output"'));
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

function normalizeMatch(value) {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractPoem(text, startLine, endLine) {
  const lines = text.split("\n").map((line) => line.trimEnd());
  const start = lines.findIndex((line) => normalizeMatch(line) === normalizeMatch(startLine));
  if (start === -1) {
    throw new Error(`Start line not found: ${startLine}`);
  }

  const end = lines.findIndex(
    (line, index) => index >= start && normalizeMatch(line) === normalizeMatch(endLine),
  );
  if (end === -1) {
    throw new Error(`End line not found: ${endLine}`);
  }

  return lines
    .slice(start, end + 1)
    .map((line) => line.replace(/^\*\s+\*\s+\*\s+\*(.*)$/u, "$1").trimEnd())
    .map((line) => line.replace("*    *    *    *Four courts I made, East, West and South and North,", "Four courts I made, East, West and South and North,"))
    .map((line) => line.replace("*    *    *    *Full of long-sounding corridors it was,", "Full of long-sounding corridors it was,"))
    .map((line) => (line === "over-vaulted grateful gloom," ? "That over-vaulted grateful gloom," : line))
    .filter((line) => line.trim() !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPoemText(pageTitle, startLine, endLine) {
  const url =
    "https://en.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Wikisource page ${pageTitle} (${response.status})`);
  }

  const json = await response.json();
  if (!json.parse?.text) {
    throw new Error(`Wikisource parse failed for ${pageTitle}`);
  }

  return extractPoem(cleanRenderedText(json.parse.text), startLine, endLine);
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
        `Public domain in the United States: first published ${poem.published_year} ` +
        `(pre-1929); text via English Wikisource.`,
      collection_title: COLLECTION_TITLE,
      collection_source_url: COLLECTION_SOURCE_URL,
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

    const textPath = path.join(poemsDir, `${poem.slug}.txt`);
    const metaPath = path.join(metaDir, `${poem.slug}.yml`);

    const text = await fetchPoemText(poem.page_title, poem.start_line, poem.end_line);
    await fs.writeFile(textPath, `${text}\n`);
    await fs.writeFile(metaPath, buildMeta(poem));
    created += 1;
    console.log(`${poem.author}: created ${poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
