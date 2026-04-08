import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const AUTHOR = {
  author: "José Martí",
  author_slug: "jose-marti",
  century: 19,
  collection_title: "Versos sencillos (1891)",
  collection_source_url: "https://es.wikisource.org/wiki/Versos_sencillos",
  text_locale: "es",
  original_language: "es",
  text_direction: "ltr",
};

const EXCLUDED_TITLES = new Set(["Versos sencillos/Prólogo"]);

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
    "https://es.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const stdout = await fetchText(url);
  const json = JSON.parse(stdout);
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
  return json.parse.text;
}

async function listPoems() {
  const rendered = await fetchRenderedText("Versos sencillos");
  const poems = [];

  for (const match of rendered.matchAll(/href="\/wiki\/(Versos_sencillos\/[^"#?]+)"/g)) {
    const encodedTitle = match[1];
    const pageTitle = decodeURIComponent(encodedTitle).replace(/_/g, " ");
    if (EXCLUDED_TITLES.has(pageTitle)) continue;

    const numeral = pageTitle.split("/").pop();
    if (!numeral) continue;

    poems.push({
      page_title: pageTitle,
      numeral,
      slug: `versos-sencillos-${numeral.toLowerCase()}`,
      source_url: `https://es.wikisource.org/wiki/${encodedTitle}`,
    });
  }

  return Array.from(new Map(poems.map((poem) => [poem.page_title, poem])).values());
}

function extractPoem(rendered, pageTitle) {
  const poemMatch = rendered.match(/<div class="poem">([\s\S]*?)<\/div>/);
  if (!poemMatch) throw new Error(`No poem block found for ${pageTitle}`);

  return stripTags(
    poemMatch[1]
      .replace(/<br\s*\/?>/g, "WIKISOURCE_LINEBREAK_TOKEN")
      .replace(/\n+/g, ""),
  )
    .replace(/WIKISOURCE_LINEBREAK_TOKEN/g, "\n")
    .replace(/^\s*\n+/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildMeta(poem) {
  return yaml.dump(
    {
      id: `${AUTHOR.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: AUTHOR.author,
      author_slug: AUTHOR.author_slug,
      title: `Versos sencillos ${poem.numeral}`,
      century: AUTHOR.century,
      text_locale: AUTHOR.text_locale,
      original_language: AUTHOR.original_language,
      text_direction: AUTHOR.text_direction,
      text_path: `poems/${AUTHOR.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Wikisource",
      source_url: poem.source_url,
      public_domain_rationale:
        "Public domain in the United States: first published in 1891 (pre-1929) and the author died in 1895; text via Spanish Wikisource.",
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
  if (poems.length !== 46) {
    throw new Error(`Expected 46 poems, found ${poems.length}`);
  }

  for (const poem of poems) {
    const rendered = await fetchRenderedText(poem.page_title);
    const text = extractPoem(rendered, poem.page_title);

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
