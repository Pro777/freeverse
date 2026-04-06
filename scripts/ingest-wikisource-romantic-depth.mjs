import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POEMS = [
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "when-i-have-fears-that-i-may-cease-to-be",
    title: "When I Have Fears That I May Cease to Be",
    published_year: 1818,
    source_url:
      "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/Sonnet:_%27When_I_have_fears_that_I_may_cease_to_be%27",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/Sonnet: 'When I have fears that I may cease to be'",
    start_line: "When I have fears that I may cease to be",
    end_line: "Till Love and Fame to nothingness do sink.",
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    century: 19,
    slug: "on-the-sea",
    title: "On the Sea",
    published_year: 1817,
    source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats/On_the_Sea",
    collection_title: "The Complete Poetical Works and Letters of John Keats",
    collection_source_url: "https://en.wikisource.org/wiki/The_complete_poetical_works_and_letters_of_John_Keats",
    page_title: "The complete poetical works and letters of John Keats/On the Sea",
    start_line: "It keeps eternal whisperings around",
    end_line: "Until ye start, as if the sea-nymphs quired!",
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    century: 19,
    slug: "so-well-go-no-more-a-roving",
    title: "So We'll Go No More a Roving",
    published_year: 1830,
    source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4/So_we%27ll_go_no_more_a-roving",
    collection_title: "The Works of Lord Byron (ed. Coleridge, Prothero), Poetry Volume 4",
    collection_source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4",
    page_title: "The Works of Lord Byron (ed. Coleridge, Prothero)/Poetry/Volume 4/So we'll go no more a-roving",
    start_line: "So we'll go no more a-roving",
    end_line: "By the light of the moon.",
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    century: 19,
    slug: "darkness",
    title: "Darkness",
    published_year: 1816,
    source_url: "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4/Darkness",
    collection_title: "The Works of Lord Byron (ed. Coleridge, Prothero), Poetry Volume 4",
    collection_source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4",
    page_title: "The Works of Lord Byron (ed. Coleridge, Prothero)/Poetry/Volume 4/Darkness",
    start_line: "I had a dream, which was not all a dream.",
    end_line: "A lump of death—a chaos of hard clay.",
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    century: 19,
    slug: "prometheus",
    title: "Prometheus",
    published_year: 1816,
    source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4/Prometheus",
    collection_title: "The Works of Lord Byron (ed. Coleridge, Prothero), Poetry Volume 4",
    collection_source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_4",
    page_title: "The Works of Lord Byron (ed. Coleridge, Prothero)/Poetry/Volume 4/Prometheus",
    start_line: "Titan! to whose immortal eyes",
    end_line: "And making Death a Victory.",
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    century: 19,
    slug: "on-this-day-i-complete-my-thirty-sixth-year",
    title: "On This Day I Complete My Thirty-Sixth Year",
    published_year: 1824,
    source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_7/On_this_Day_I_complete_my_Thirty-sixth_Year",
    collection_title: "The Works of Lord Byron (ed. Coleridge, Prothero), Poetry Volume 7",
    collection_source_url:
      "https://en.wikisource.org/wiki/The_Works_of_Lord_Byron_(ed._Coleridge,_Prothero)/Poetry/Volume_7",
    page_title: "The Works of Lord Byron (ed. Coleridge, Prothero)/Poetry/Volume 7/On this Day I complete my Thirty-sixth Year",
    start_line: "'T is time this heart should be unmoved,",
    end_line: "And take thy Rest.",
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
    .replace(/&#233;/g, "é")
    .replace(/&#232;/g, "è");
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

    const poemPath = path.join(poemsDir, `${poem.slug}.txt`);
    const metaPath = path.join(metaDir, `${poem.slug}.yml`);

    const text = await fetchPoemText(poem.page_title, poem.start_line, poem.end_line);
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
