import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const AUTHOR = {
  author: "Gustavo Adolfo Bécquer",
  author_slug: "gustavo-adolfo-becquer",
  century: 19,
  collection_title: "Rimas (1925)",
  collection_source_url: "https://es.wikisource.org/wiki/Rimas_(B%C3%A9cquer,_1925)",
  published_year: 1925,
  text_locale: "es",
  original_language: "es",
  text_direction: "ltr",
};

function toRoman(value) {
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remaining = value;
  let result = "";
  for (const [n, symbol] of map) {
    while (remaining >= n) {
      result += symbol;
      remaining -= n;
    }
  }
  return result;
}

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

async function fetchText(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync("curl", ["-L", "--fail", "--silent", url], {
        maxBuffer: 10 * 1024 * 1024,
      });
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
    "https://es.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const stdout = await fetchText(url);
  const json = JSON.parse(stdout);
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
  return cleanRenderedText(json.parse.text);
}

async function listPoemNumbers() {
  const html = await fetchText(AUTHOR.collection_source_url);
  const matches = html.match(/href="\/wiki\/Rimas_\([^)]+,_1925\)\/Rima_(\d+)"/g) || [];
  const numbers = new Set();
  for (const match of matches) {
    const num = Number(match.match(/Rima_(\d+)"/)?.[1]);
    if (Number.isFinite(num)) numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function extractPoem(text, numeral) {
  const lines = text.split("\n").map((line) => line.trimEnd());
  const numeralIndex = lines.findIndex((line) => line.trim() === numeral);
  if (numeralIndex === -1) throw new Error(`Heading ${numeral} not found`);

  return lines
    .slice(numeralIndex + 1)
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildMeta(number, numeral) {
  const slug = `rima-${String(number).padStart(3, "0")}`;
  return yaml.dump(
    {
      id: `${AUTHOR.author_slug}/${slug}`,
      slug,
      author: AUTHOR.author,
      author_slug: AUTHOR.author_slug,
      title: `Rima ${numeral}`,
      century: AUTHOR.century,
      text_locale: AUTHOR.text_locale,
      original_language: AUTHOR.original_language,
      text_direction: AUTHOR.text_direction,
      text_path: `poems/${AUTHOR.author_slug}/${slug}.txt`,
      text_in_repo: true,
      source_label: "Wikisource",
      source_url: `https://es.wikisource.org/wiki/Rimas_(B%C3%A9cquer,_1925)/Rima_${number}`,
      public_domain_rationale:
        "Public domain in the United States: this edition was published in 1925 (pre-1929) and the author died in 1870; text via Spanish Wikisource.",
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

  const poemNumbers = await listPoemNumbers();
  if (poemNumbers.length !== 76) {
    throw new Error(`Expected 76 rimas, found ${poemNumbers.length}`);
  }

  for (const number of poemNumbers) {
    const numeral = toRoman(number);
    const pageTitle = `Rimas (Bécquer, 1925)/Rima ${number}`;
    const rendered = await fetchRenderedText(pageTitle);
    const text = extractPoem(rendered, numeral);
    const slug = `rima-${String(number).padStart(3, "0")}`;

    await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${text}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(number, numeral), "utf8");
    console.log(`${AUTHOR.author}: created ${slug}`);
  }

  console.log(`Total created: ${poemNumbers.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
