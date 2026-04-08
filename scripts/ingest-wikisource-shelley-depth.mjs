import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const COLLECTION_TITLE = "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)";
const COLLECTION_SOURCE_URL =
  "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)";

const POEMS = [
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    century: 19,
    slug: "hymn-to-intellectual-beauty",
    title: "Hymn to Intellectual Beauty",
    published_year: 1817,
    source_url:
      "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)/Hymn_to_Intellectual_Beauty",
    page_title: "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)/Hymn to Intellectual Beauty",
    start_line: "The awful shadow of some unseen Power",
    end_line: "To fear himself, and love all human kind.",
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    century: 19,
    slug: "the-cloud",
    title: "The Cloud",
    published_year: 1820,
    source_url:
      "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)/The_Cloud",
    page_title: "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)/The Cloud",
    start_line: "I bring fresh showers for the thirsting flowers,",
    end_line: "I arise and unbuild it again.",
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    century: 19,
    slug: "to-wordsworth",
    title: "To Wordsworth",
    published_year: 1816,
    source_url:
      "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)/To_Wordsworth",
    page_title: "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)/To Wordsworth",
    start_line: "Poet of Nature, thou hast wept to know",
    end_line: "Thus having been, that thou shouldst cease to be.",
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    century: 19,
    slug: "mont-blanc",
    title: "Mont Blanc",
    published_year: 1817,
    source_url:
      "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)/Mont_Blanc",
    page_title: "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)/Mont Blanc",
    start_line: "The everlasting universe of things",
    end_line: "Silence and solitude were vacancy?",
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    century: 19,
    slug: "stanzas-written-in-dejection-near-naples",
    title: "Stanzas Written in Dejection, near Naples",
    published_year: 1824,
    source_url:
      "https://en.wikisource.org/wiki/The_Complete_Poetical_Works_of_Percy_Bysshe_Shelley_(ed._Hutchinson,_1914)/Stanzas_written_in_Dejection,_near_Naples",
    page_title:
      "The Complete Poetical Works of Percy Bysshe Shelley (ed. Hutchinson, 1914)/Stanzas written in Dejection, near Naples",
    start_line: "The sun is warm, the sky is clear,",
    end_line: "Will linger, though enjoyed, like joy in memory yet.",
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
    .replace(/&#230;/g, "æ")
    .replace(/&#339;/g, "œ");
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
    .replace(/\s*\d+$/u, "")
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
    .map((line) => line.replace(/\s*\d+$/u, ""))
    .filter((line) => !/^(?:[IVX]+\.|\d+\.)$/.test(line.trim()))
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

    try {
      await fs.access(textPath);
      console.log(`Skipping existing poem text: ${textPath}`);
      continue;
    } catch {}

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
