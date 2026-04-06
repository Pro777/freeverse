import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const AUTHOR = {
  author: "Paul Verlaine",
  author_slug: "paul-verlaine",
  century: 19,
  collection_title: "Poèmes saturniens (1866)",
  collection_source_url: "https://fr.wikisource.org/wiki/Po%C3%A8mes_saturniens_(1866)",
  text_locale: "fr",
  original_language: "fr",
  text_direction: "ltr",
};

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

function normalizePoemParagraph(value) {
  return value.replace(/\n{3,}/g, "\u0000").replace(/\n{2}/g, "\n").replace(/\u0000/g, "\n\n");
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
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
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
  const rendered = await fetchRenderedText("Poèmes saturniens (1866)");
  const matches = [
    ...rendered.matchAll(
      /href="\/wiki\/(Po%C3%A8mes_saturniens_\(1866\)\/[^"#?]+)"[^>]*>([^<]+)<\/a>/g,
    ),
  ];

  const poems = [];
  for (const match of matches) {
    const pagePath = decodeURIComponent(match[1]);
    const title = stripTags(match[2]);
    const slug = slugify(pagePath.replace("Poèmes_saturniens_(1866)/", ""));
    poems.push({
      page_title: pagePath.replace(/_/g, " "),
      title,
      slug,
      source_url: `https://fr.wikisource.org/wiki/${match[1]}`,
    });
  }

  return poems;
}

function extractBody(rendered, pageTitle) {
  const poemBlocks = [...rendered.matchAll(/<div class="poem verse">([\s\S]*?)<\/div>/g)];
  if (!poemBlocks.length) throw new Error(`No poem blocks found for ${pageTitle}`);

  const stanzas = poemBlocks
    .map((match) => {
      const html = match[1].replace(/<span[^>]*class="pagenum[\s\S]*?<\/span><\/span>/g, "");
      const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)];
      const stanza = paragraphs
        .map((paragraph) =>
          normalizePoemParagraph(
            stripTags(
              paragraph[1]
                .replace(/<br\s*\/?>/g, "\n")
                .replace(/^\s*\n+/, ""),
            ),
          ),
        )
        .filter(Boolean)
        .join("\n\n");
      return stanza;
    })
    .filter(Boolean);

  return stanzas.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildMeta(poem) {
  return yaml.dump(
    {
      id: `${AUTHOR.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: AUTHOR.author,
      author_slug: AUTHOR.author_slug,
      title: poem.title,
      century: AUTHOR.century,
      text_locale: AUTHOR.text_locale,
      original_language: AUTHOR.original_language,
      text_direction: AUTHOR.text_direction,
      text_path: `poems/${AUTHOR.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Wikisource",
      source_url: poem.source_url,
      public_domain_rationale:
        "Public domain in the United States: first published in 1866 (pre-1929) and the author died in 1896; text via French Wikisource.",
      collection_title: AUTHOR.collection_title,
      collection_source_url: AUTHOR.collection_source_url,
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  const poemsDir = path.join("poems", AUTHOR.author_slug);
  const metaDir = path.join("meta", AUTHOR.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const poems = await listPoems();
  if (poems.length !== 40) {
    throw new Error(`Expected 40 poems, found ${poems.length}`);
  }

  for (const poem of poems) {
    const rendered = await fetchRenderedText(poem.page_title);
    const text = extractBody(rendered, poem.page_title);
    await fs.writeFile(path.join(poemsDir, `${poem.slug}.txt`), `${text}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${poem.slug}.yml`), buildMeta(poem), "utf8");
    console.log(`${AUTHOR.author}: created ${poem.slug}`);
  }

  console.log(`Total created: ${poems.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
