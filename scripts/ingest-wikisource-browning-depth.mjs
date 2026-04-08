import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const POEMS = [
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "incident-of-the-french-camp",
    title: "Incident of the French Camp",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Poems_That_Every_Child_Should_Know/An_Incident_of_the_French_Camp",
    collection_title: "Poems That Every Child Should Know",
    collection_source_url: "https://en.wikisource.org/wiki/Poems_That_Every_Child_Should_Know",
    page_title: "Poems That Every Child Should Know/An Incident of the French Camp",
    start_line: "You know, we French storm'd Ratisbon:",
    end_line: "Smiling the boy fell dead.",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "the-patriot",
    title: "The Patriot",
    published_year: 1855,
    source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)/Volume_1/The_Patriot",
    collection_title: "Men and Women",
    collection_source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)",
    page_title: "Men and Women (Browning)/Volume 1/The Patriot",
    start_line: "It was roses, roses, all the way,",
    end_line: "'Tis God shall requite! I am safer so.",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "the-last-ride-together",
    title: "The Last Ride Together",
    published_year: 1855,
    source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)/Volume_1/The_Last_Ride_Together",
    collection_title: "Men and Women",
    collection_source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)",
    page_title: "Men and Women (Browning)/Volume 1/The Last Ride Together",
    start_line: "I said—Then, dearest, since 'tis so,",
    end_line: "Ride, ride together, for ever ride?",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "evelyn-hope",
    title: "Evelyn Hope",
    published_year: 1855,
    source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)/Volume_1/Evelyn_Hope",
    collection_title: "Men and Women",
    collection_source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)",
    page_title: "Men and Women (Browning)/Volume 1/Evelyn Hope",
    start_line: "Beautiful Evelyn Hope is dead",
    end_line: "You will wake, and remember, and understand.",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "love-among-the-ruins",
    title: "Love Among the Ruins",
    published_year: 1855,
    source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)/Volume_1/Love_Among_the_Ruins",
    collection_title: "Men and Women",
    collection_source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)",
    page_title: "Men and Women (Browning)/Volume 1/Love Among the Ruins",
    start_line: "Where the quiet-coloured end of evening smiles",
    end_line: "Love is best!",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "soliloquy-of-the-spanish-cloister",
    title: "Soliloquy of the Spanish Cloister",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Soliloquy_of_the_Spanish_Cloister",
    collection_title: "Dramatic Lyrics",
    collection_source_url: "https://en.wikisource.org/wiki/Bells_and_Pomegranates,_First_Series",
    page_title: "Bells and Pomegranates, First Series/Cloister (Spanish)",
    start_line: "Gr-r-r—there go, my heart's abhorrence!",
    end_line: "Ave, Virgo! Gr-r-r—you swine!",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "the-pied-piper-of-hamelin",
    title: "The Pied Piper of Hamelin",
    published_year: 1842,
    source_url: "https://en.wikisource.org/wiki/Bells_and_Pomegranates,_First_Series/The_Pied_Piper_of_Hamelin",
    collection_title: "Dramatic Lyrics",
    collection_source_url: "https://en.wikisource.org/wiki/Bells_and_Pomegranates,_First_Series",
    page_title: "Bells and Pomegranates, First Series/The Pied Piper of Hamelin",
    start_line: "Hamelin Town's in Brunswick,",
    end_line: "If we've promised them aught, let us keep our promise.",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "the-lost-mistress",
    title: "The Lost Mistress",
    published_year: 1845,
    source_url: "https://en.wikisource.org/wiki/Bells_and_Pomegranates,_Second_Series/The_Lost_Mistress",
    collection_title: "Dramatic Romances and Lyrics",
    collection_source_url: "https://en.wikisource.org/wiki/Bells_and_Pomegranates,_Second_Series",
    page_title: "Bells and Pomegranates, Second Series/The Lost Mistress",
    start_line: "All's over, then—does truth sound bitter",
    end_line: "Or so very little longer!",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "a-womans-last-word",
    title: "A Woman's Last Word",
    published_year: 1855,
    source_url: "https://en.wikisource.org/wiki/A_Woman%27s_Last_Word",
    collection_title: "Men and Women",
    collection_source_url: "https://en.wikisource.org/wiki/Men_and_Women_(Browning)",
    page_title: "Men and Women (Browning)/Volume 1/A Woman's Last Word",
    start_line: "Let's contend no more, Love,",
    end_line: "Loved by thee.",
  },
  {
    author: "Robert Browning",
    author_slug: "robert-browning",
    century: 19,
    slug: "prospice",
    title: "Prospice",
    published_year: 1864,
    source_url: "https://en.wikisource.org/wiki/Dramatis_Person%C3%A6/Prospice",
    collection_title: "Dramatis Personæ",
    collection_source_url: "https://en.wikisource.org/wiki/Dramatis_Person%C3%A6",
    page_title: "Dramatis Personæ/Prospice",
    start_line: "Fear death?—to feel the fog in my throat,",
    end_line: "And with God be the rest!",
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
  const normalizeMatch = (value) =>
    value
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();

  const start = lines.findIndex((line) => normalizeMatch(line) === normalizeMatch(startLine));
  if (start === -1) throw new Error(`Start line not found: ${startLine}`);

  const end = lines.findIndex(
    (line, index) => index >= start && normalizeMatch(line) === normalizeMatch(endLine),
  );
  if (end === -1) throw new Error(`End line not found: ${endLine}`);

  return lines
    .slice(start, end + 1)
    .filter((line) => !/^\d+\.$/.test(line.trim()))
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
