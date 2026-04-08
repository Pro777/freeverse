import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const POEMS = [
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "gods-grandeur",
    title: "God's Grandeur",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/God%27s_Grandeur",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/God's Grandeur",
    start_line: "The world is charged with the grandeur of God.",
    end_line: "World broods with warm breast and with ah! bright wings.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "the-starlight-night",
    title: "The Starlight Night",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/The_Starlight_Night",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/The Starlight Night",
    start_line: "Look at the stars! look, look up at the skies!",
    end_line: "Christ home, Christ and his mother and all his hallows.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "spring",
    title: "Spring",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/Spring",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/Spring",
    start_line: "Nothing is so beautiful as spring—",
    end_line: "Most, O maid's child, thy choice and worthy the winning.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "the-windhover",
    title: "The Windhover",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/The_Windhover",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/The Windhover",
    start_line: "I caught this morning morning's minion, king-",
    end_line: "Fall, gall themselves, and gash gold-vermillion.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "binsey-poplars",
    title: "Binsey Poplars",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/Binsey_Poplars",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/Binsey Poplars",
    start_line: "My aspens dear, whose airy cages quelled,",
    end_line: "Sweet especial rural scene.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "spring-and-fall",
    title: "Spring and Fall",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/Spring_and_Fall",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/Spring and Fall",
    start_line: "Márgarét, are you gríeving",
    end_line: "It is Margaret you mourn for.",
  },
  {
    author: "Gerard Manley Hopkins",
    author_slug: "gerard-manley-hopkins",
    century: 19,
    slug: "inversnaid",
    title: "Inversnaid",
    published_year: 1918,
    source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins/Inversnaid",
    collection_title: "Poems of Gerard Manley Hopkins",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_of_Gerard_Manley_Hopkins",
    page_title: "Poems of Gerard Manley Hopkins/Inversnaid",
    start_line: "This darksome burn, horseback brown,",
    end_line: "Long live the weeds and the wilderness yet.",
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
    .replace(/&#8230;/g, "…");
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

function extractPoem(text, startLine, endLine) {
  const lines = text.split("\n").map((line) => line.trimEnd());
  const start = lines.findIndex((line) => line.trim() === startLine);
  if (start === -1) throw new Error(`Start line not found: ${startLine}`);

  const end = lines.findIndex((line, index) => index >= start && line.trim() === endLine);
  if (end === -1) throw new Error(`End line not found: ${endLine}`);

  return lines
    .slice(start, end + 1)
    .filter((line) => !/^\d+$/.test(line.trim()))
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
