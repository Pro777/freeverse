import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POEMS = [
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "ode-on-melancholy",
    title: "Ode on Melancholy",
    published_year: 1820,
    source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/Ode_on_Melancholy",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/Ode on Melancholy",
    start_line: "No, no! go not to Lethe, neither twist",
    end_line: "And be among her cloudy trophies hung.",
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "ode-to-psyche",
    title: "Ode to Psyche",
    published_year: 1820,
    source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/Ode_to_Psyche",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/Ode to Psyche",
    start_line: "O goddess! hear these tuneless numbers, wrung",
    end_line: "To let the warm Love in!",
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "to-sleep",
    title: "To Sleep",
    published_year: 1816,
    source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/To_Sleep",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/To Sleep",
    start_line: "O soft embalmer of the still midnight,",
    end_line: "And seal the hushed casket of my soul.",
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "on-sitting-down-to-read-king-lear-once-again",
    title: "On Sitting Down to Read King Lear Once Again",
    published_year: 1818,
    source_url:
      "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/On_sitting_down_to_read_%27King_Lear%27_once_again",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/On sitting down to read 'King Lear' once again",
    start_line: "O golden-tongued Romance, with serene lute!",
    end_line: "Give me new Phœnix-wings to fly at my desire.",
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "in-a-drear-nighted-december",
    title: "In a Drear-Nighted December",
    published_year: 1817,
    source_url:
      "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/Stanzas:_%27In_a_drear-nighted_December%27",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/Stanzas: 'In a drear-nighted December'",
    start_line: "In a drear-nighted December,",
    end_line: "Was never said in rhyme.",
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
  return value.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
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
    .map((line) => line.replace(/(?<=[A-Za-zÀ-ÿ.,;:!?—’'"\]])\d+$/u, ""))
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
