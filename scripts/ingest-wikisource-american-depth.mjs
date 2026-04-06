import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const POEMS = [
  {
    author: "Ralph Waldo Emerson",
    author_slug: "ralph-waldo-emerson",
    century: 19,
    slug: "each-and-all",
    title: "Each and All",
    published_year: 1847,
    source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)/Each_and_All",
    collection_title: "Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)",
    page_title: "Poems (Emerson, 1847)/Each and All",
    start_line: "Little thinks, in the field, yon red-cloaked clown,",
    end_line: "I yielded myself to the perfect whole.",
  },
  {
    author: "Ralph Waldo Emerson",
    author_slug: "ralph-waldo-emerson",
    century: 19,
    slug: "the-snow-storm",
    title: "The Snow-Storm",
    published_year: 1847,
    source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)/The_Snow-Storm",
    collection_title: "Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)",
    page_title: "Poems (Emerson, 1847)/The Snow-Storm",
    start_line: "Announced by all the trumpets of the sky,",
    end_line: "The frolic architecture of the snow.",
  },
  {
    author: "Ralph Waldo Emerson",
    author_slug: "ralph-waldo-emerson",
    century: 19,
    slug: "give-all-to-love",
    title: "Give All to Love",
    published_year: 1847,
    source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)/Give_all_to_Love",
    collection_title: "Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_(Emerson,_1847)",
    page_title: "Poems (Emerson, 1847)/Give all to Love",
    start_line: "Give all to love;",
    end_line: "The gods arrive.",
  },
  {
    author: "Oliver Wendell Holmes, Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    century: 19,
    slug: "the-deacons-masterpiece",
    title: "The Deacon's Masterpiece",
    published_year: 1858,
    source_url: "https://en.wikisource.org/wiki/The_Deacon%27s_Masterpiece",
    collection_title: "The Professor at the Breakfast-Table",
    collection_source_url: "https://en.wikisource.org/wiki/The_Professor_at_the_Breakfast-Table",
    page_title: "The Deacon's Masterpiece",
    start_line: "Have you heard of the wonderful one-hoss shay,",
    end_line: "Logic is logic. That's all I say.",
  },
  {
    author: "Oliver Wendell Holmes, Sr.",
    author_slug: "oliver-wendell-holmes-sr",
    century: 19,
    slug: "the-last-leaf",
    title: "The Last Leaf",
    published_year: 1831,
    source_url: "https://en.wikisource.org/wiki/The_Last_Leaf_(Holmes)",
    collection_title: "Poems",
    collection_source_url: "https://en.wikisource.org/wiki/The_Last_Leaf_(Holmes)",
    page_title: "The Last Leaf (Holmes)",
    start_line: "I saw him once before,",
    end_line: "Where I cling.",
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
    .replace(/&#8195;/g, "")
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

async function fetchRenderedText(pageTitle) {
  const url =
    "https://en.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const { stdout } = await execFileAsync("curl", ["-L", "--fail", "--silent", url], {
    maxBuffer: 10 * 1024 * 1024,
  });
  const json = JSON.parse(stdout);
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
  return cleanRenderedText(json.parse.text);
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
      collection_title: poem.collection_title,
      collection_source_url: poem.collection_source_url,
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

    const rendered = await fetchRenderedText(poem.page_title);
    const text = extractPoem(rendered, poem.start_line, poem.end_line);
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
