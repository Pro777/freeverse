import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POEMS = [
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "the-garden",
    title: "The Garden",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/The_Garden",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/The Garden",
    start_line: "How vainly men themselves amaze",
    end_line: "Be reckon'd but with herbs and flow'rs!",
  },
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "the-definition-of-love",
    title: "The Definition of Love",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/The_Definition_of_Love",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/The Definition of Love",
    start_line: "My Love is of a birth as rare",
    end_line: "And Opposition of the Stars.",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "l-allegro",
    title: "L'Allegro",
    published_year: 1645,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/L%27Allegro",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/L'Allegro",
    start_line: "HEnce, loathed Melancholy,",
    end_line: "Mirth with thee, I mean to live.",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "lycidas",
    title: "Lycidas",
    published_year: 1638,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/Lycidas",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/Lycidas",
    start_line: "YEt once more, O ye Laurels, and once more",
    end_line: "To morrow to fresh Woods, and Pastures new.",
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
    .filter((line) => !/^[IVXLC]+[.]?$/.test(line.trim()))
    .filter(
      (line) =>
        !["L'Allegro.", "Lycidas.", "The Garden.", "The Definition of Love."].includes(
          line.trim(),
        ),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPoemText(pageTitle, startLine, endLine) {
  const url =
    "https://en.wikisource.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(pageTitle);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch Wikisource page ${pageTitle} (${response.status})`);

  const json = await response.json();
  if (!json.parse?.text) throw new Error(`Wikisource parse failed for ${pageTitle}`);
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
