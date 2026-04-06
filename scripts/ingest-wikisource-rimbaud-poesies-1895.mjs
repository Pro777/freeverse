import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const AUTHOR = {
  author: "Arthur Rimbaud",
  author_slug: "arthur-rimbaud",
  century: 19,
  collection_title: "Poésies (éd. Vanier, 1895)",
  collection_source_url: "https://fr.wikisource.org/wiki/Po%C3%A9sies_(Rimbaud)/%C3%A9d._Vanier,_1895",
  text_locale: "fr",
  original_language: "fr",
  text_direction: "ltr",
};

const EXCLUDED_TITLES = new Set(["Poésies (Rimbaud)/éd. Vanier, 1895/Préface de Paul Verlaine"]);

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
    .replace(/&#8203;/g, "")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ""))
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function slugify(value) {
  return value
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "ae")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function fetchText(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync(
        "curl",
        ["-L", "--fail", "--silent", "-A", "Mozilla/5.0", url],
        { maxBuffer: 10 * 1024 * 1024 },
      );
      return stdout;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
}

async function fetchRenderedText(pageTitle) {
  const url =
    "https://fr.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const stdout = await fetchText(url);
  const json = JSON.parse(stdout);
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
  return json.parse.text;
}

async function listPoems() {
  const rendered = await fetchRenderedText("Poésies (Rimbaud)/éd. Vanier, 1895");
  const poems = [];
  for (const match of rendered.matchAll(/href="\/wiki\/(Po%C3%A9sies_\(Rimbaud\)\/%C3%A9d\._Vanier,_1895\/[^"#?]+)"/g)) {
    const encodedTitle = match[1];
    const pageTitle = decodeURIComponent(encodedTitle).replace(/_/g, " ");
    if (EXCLUDED_TITLES.has(pageTitle)) continue;
    poems.push({
      page_title: pageTitle,
      slug: slugify(pageTitle.replace("Poésies (Rimbaud)/éd. Vanier, 1895/", "")),
      source_url: `https://fr.wikisource.org/wiki/${encodedTitle}`,
    });
  }

  const deduped = Array.from(new Map(poems.map((poem) => [poem.page_title, poem])).values());
  deduped.sort((a, b) => a.page_title.localeCompare(b.page_title, "fr"));
  return deduped;
}

function extractTitle(rendered, fallbackTitle) {
  const headingMatch = rendered.match(/<h3 id="[^"]*"[^>]*>\s*([^<]+?)\s*<\/h3>/);
  return headingMatch ? stripTags(headingMatch[1]) : fallbackTitle;
}

function extractDateNote(rendered) {
  const noteMatch =
    rendered.match(/<div style="margin-left:5em;font-size:90%;">([\s\S]*?)<\/div>/) ||
    rendered.match(/<p><span style="font-size:90%">([\s\S]*?)<\/span>/);
  if (!noteMatch) return undefined;
  const note = stripTags(noteMatch[1]);
  return note || undefined;
}

function extractPoem(rendered, pageTitle) {
  const poemMatches = [...rendered.matchAll(/<div class="poem(?: verse)?">([\s\S]*?)<\/div>/g)];
  if (poemMatches.length) {
    return poemMatches
      .map((match) => stripTags(match[1].replace(/<br\s*\/?>/g, "\n")).replace(/\n{3,}/g, "\n\n").trim())
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  const bodyStart = rendered.search(/<h[34]\b/);
  if (bodyStart === -1) throw new Error(`No poem block found for ${pageTitle}`);

  const body = rendered.slice(bodyStart);
  const blocks = [...body.matchAll(/<(h4|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/g)]
    .map((match) => {
      const tag = match[1];
      const text = stripTags(match[2].replace(/<br\s*\/?>/g, "\n")).replace(/\n{3,}/g, "\n\n").trim();
      if (!text) return "";
      return tag === "p" ? text : text.replace(/\n{2,}/g, "\n");
    })
    .filter(Boolean);

  if (!blocks.length) throw new Error(`No fallback content found for ${pageTitle}`);
  return blocks.join("\n\n").trim();
}

function buildMeta(poem, title, note) {
  const meta = {
    id: `${AUTHOR.author_slug}/${poem.slug}`,
    slug: poem.slug,
    author: AUTHOR.author,
    author_slug: AUTHOR.author_slug,
    title,
    century: AUTHOR.century,
    text_locale: AUTHOR.text_locale,
    original_language: AUTHOR.original_language,
    text_direction: AUTHOR.text_direction,
    text_path: `poems/${AUTHOR.author_slug}/${poem.slug}.txt`,
    text_in_repo: true,
    source_label: "Wikisource",
    source_url: poem.source_url,
    public_domain_rationale:
      "Public domain in the United States: this edition was published in 1895 (pre-1929) and the author died in 1891; text via French Wikisource.",
    collection_title: AUTHOR.collection_title,
    collection_source_url: AUTHOR.collection_source_url,
  };
  if (note) meta.notes = note;
  return yaml.dump(meta, { lineWidth: 1000 });
}

async function main() {
  const poemsDir = path.join("poems", AUTHOR.author_slug);
  const metaDir = path.join("meta", AUTHOR.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const poems = await listPoems();
  if (poems.length !== 46) {
    throw new Error(`Expected 46 poems, found ${poems.length}`);
  }

  for (const poem of poems) {
    const rendered = await fetchRenderedText(poem.page_title);
    const title = extractTitle(rendered, poem.page_title.split("/").pop() ?? poem.slug);
    const text = extractPoem(rendered, poem.page_title);
    const note = extractDateNote(rendered);

    await fs.writeFile(path.join(poemsDir, `${poem.slug}.txt`), `${text}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${poem.slug}.yml`), buildMeta(poem, title, note), "utf8");
    console.log(`${AUTHOR.author}: created ${poem.slug}`);
  }

  console.log(`Total created: ${poems.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
