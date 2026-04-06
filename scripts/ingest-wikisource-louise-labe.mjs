import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const execFileAsync = promisify(execFile);

const AUTHOR = {
  author: "Louise Labé",
  author_slug: "louise-labe",
  century: 16,
  collection_title: "Élégies et Sonnets",
  collection_source_url: "https://fr.wikisource.org/wiki/%C3%89l%C3%A9gies_et_Sonnets",
  published_year: 1555,
  text_locale: "fr",
  original_language: "fr",
  text_direction: "ltr",
};

const SONNET_ONE_TEXT = `Non hauria Ulysse o qualunqu’altro mai
Piu accorto fui, da quel diuino aspetto
Pien di gratie, d’honor et di rispetto
Sperato qual i sento affanni e guai.

Pur, Amor, co i begli ochi tu fatt’ hai
Tal piaga dentro al mio innocente petto,
Di cibo et di calor gia tuo ricetto,
Che rimedio non v’e si tu nol’ dai.

O forte dura, che mi fa esser quale
Punta d’un Scorpio, et domandar riparo
Contr’ el velen’ d’all’ istesso animale.

Chieggio li fol’ ancida questa noia,
Non estingua el desir a me si caro,
Che mancar non potra ch’ i non mi muoia.`;

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
    .replace(/&#8230;/g, "…")
    .replace(/&#x25c4;/gi, "")
    .replace(/&#x25ba;/gi, "");
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

async function fetchRenderedText(pageTitle = "Élégies et Sonnets/Texte_entier") {
  const url =
    "https://fr.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const stdout = await fetchText(url);
  const json = JSON.parse(stdout);
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
  return cleanRenderedText(json.parse.text);
}

function extractPoems(text) {
  const lines = text.split("\n").map((line) => line.trimEnd());
  const start = lines.findIndex(
    (line, index) =>
      line.trim() === "ÉLÉGIES" &&
      lines[index + 1]?.trim() === "ÉLÉGIES" &&
      /^[IVXLCDM]+$/.test(lines[index + 3]?.trim() || ""),
  );
  if (start === -1) throw new Error("Poem section start not found");

  const end = lines.findIndex((line, index) => index > start && line.trim() === "fin des evvres de lovïze labe lionnoize");
  if (end === -1) throw new Error("Poem section end not found");

  let currentKind = "elegie";
  let currentLines = [];
  let elegyIndex = 0;
  let sonnetIndex = 0;
  const poems = [];

  const flush = () => {
    if (currentLines.length === 0) return;
    if (currentKind === "elegie") elegyIndex += 1;
    else sonnetIndex += 1;

    const index = currentKind === "elegie" ? elegyIndex : sonnetIndex;
    poems.push({
      kind: currentKind,
      index,
      text: currentLines.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    });
    currentLines = [];
  };

  for (const line of lines.slice(start + 2, end)) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentLines.length > 0) currentLines.push("");
      continue;
    }
    if (trimmed === "ÉLÉGIES" || trimmed === "LES ÉLÉGIES") continue;
    if (trimmed === "SONNETS") {
      flush();
      currentKind = "sonnet";
      continue;
    }
    if (/^[IVXLCDM]+$/.test(trimmed)) {
      flush();
      continue;
    }
    currentLines.push(line);
  }

  flush();

  if (poems.length !== 26) {
    throw new Error(`Expected 26 poems from full text, found ${poems.length}`);
  }

  for (const poem of poems) {
    if (poem.kind === "sonnet") poem.index += 1;
  }

  return poems;
}

function buildMeta(kind, index, overrides = {}) {
  const numeral = toRoman(index);
  const slug = `${kind}-${String(index).padStart(2, "0")}`;
  const title = `${kind === "elegie" ? "Élégie" : "Sonnet"} ${numeral}`;
  return yaml.dump(
    {
      id: `${AUTHOR.author_slug}/${slug}`,
      slug,
      author: AUTHOR.author,
      author_slug: AUTHOR.author_slug,
      title,
      century: AUTHOR.century,
      text_locale: overrides.text_locale ?? AUTHOR.text_locale,
      original_language: overrides.original_language ?? AUTHOR.original_language,
      text_direction: overrides.text_direction ?? AUTHOR.text_direction,
      text_path: `poems/${AUTHOR.author_slug}/${slug}.txt`,
      text_in_repo: true,
      source_label: "Wikisource",
      source_url: AUTHOR.collection_source_url,
      public_domain_rationale:
        "Public domain in the United States: first published in 1555 (pre-1929); text via French Wikisource.",
      collection_title: AUTHOR.collection_title,
      collection_source_url: AUTHOR.collection_source_url,
    },
    { lineWidth: 1000 },
  );
}

async function writePoem(poem) {
  const poemsDir = path.join("poems", AUTHOR.author_slug);
  const metaDir = path.join("meta", AUTHOR.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const slug = `${poem.kind}-${String(poem.index).padStart(2, "0")}`;
  await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${poem.text}\n`, "utf8");
  await fs.writeFile(
    path.join(metaDir, `${slug}.yml`),
    buildMeta(poem.kind, poem.index, poem),
    "utf8",
  );
  console.log(`${AUTHOR.author}: created ${slug}`);
}

async function main() {
  const collectionRendered = await fetchRenderedText();
  const poems = extractPoems(collectionRendered);
  poems.unshift({
    kind: "sonnet",
    index: 1,
    text: SONNET_ONE_TEXT,
    text_locale: "it",
    original_language: "it",
  });

  if (poems.length !== 27) {
    throw new Error(`Expected 27 poems total, found ${poems.length}`);
  }

  for (const poem of poems) {
    await writePoem(poem);
  }
  console.log(`Total created: ${poems.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
