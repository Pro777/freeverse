import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POEMS = [
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "on-a-drop-of-dew",
    title: "On a Drop of Dew",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/On_a_Drop_of_Dew",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/On a Drop of Dew",
    start_line: "See how the Orient Dew,",
    end_line: "Into the Glories of th' Almighty Sun.",
  },
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "bermudas",
    title: "Bermudas",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/Bermudas",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/Bermudas",
    start_line: "Where the remote Bermudas ride",
    end_line: "With falling Oars they kept the time.",
  },
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "the-coronet",
    title: "The Coronet",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/The_Coronet",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/The Coronet",
    start_line: "When for the Thorns with which I long, too long,",
    end_line: "May crown thy Feet, that could not crown thy Head.",
  },
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "eyes-and-tears",
    title: "Eyes and Tears",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/Eyes_and_Tears",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/Eyes and Tears",
    start_line: "How wisely Nature did decree,",
    end_line: "These weeping Eyes, those seeing Tears.",
  },
  {
    author: "Andrew Marvell",
    author_slug: "andrew-marvell",
    century: 17,
    slug: "the-fair-singer",
    title: "The Fair Singer",
    published_year: 1681,
    source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)/The_Fair_Singer",
    collection_title: "Miscellaneous Poems",
    collection_source_url: "https://en.wikisource.org/wiki/Miscellaneous_Poems_(Marvell)",
    page_title: "Miscellaneous Poems (Marvell)/The Fair Singer",
    start_line: "To make a final conquest of all me,",
    end_line: "She having gained both the Wind and Sun.",
  },
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
    slug: "il-penseroso",
    title: "Il Penseroso",
    published_year: 1645,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/Il_Penseroso",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/Il Penseroso",
    start_line: "HEnce vain deluding joyes,",
    end_line: "And I with thee will choose to live.",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "on-time",
    title: "On Time",
    published_year: 1645,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/On_Time",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/On Time",
    start_line: "FLy envious Time, till thou run out thy race,",
    end_line: "Triumphing over Death, and Chance, and thee O Time,",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "at-a-solemn-musick",
    title: "At a Solemn Musick",
    published_year: 1645,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/At_a_Solemn_Musick",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/At a Solemn Musick",
    start_line: "BLest pair of Sirens, pledges of Heav'ns joy,",
    end_line: "To live with him, and sing in endles morn of light.",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "on-may-morning",
    title: "On May Morning",
    published_year: 1645,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/On_May_Morning",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/On May Morning",
    start_line: "NOw the bright morning Star, Dayes harbinger,",
    end_line: "And welcom thee, and wish thee long.",
  },
  {
    author: "John Milton",
    author_slug: "john-milton",
    century: 17,
    slug: "on-shakespear",
    title: "On Shakespear",
    published_year: 1630,
    source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times/On_Shakespear",
    collection_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times",
    collection_source_url:
      "https://en.wikisource.org/wiki/Poems_of_Mr._John_Milton,_Both_English_and_Latin,_Compos%27d_at_several_times",
    page_title: "Poems of Mr. John Milton, Both English and Latin, Compos'd at several times/On Shakespear",
    start_line: "WHat needs my Shakespear for his honour'd Bones,",
    end_line: "That Kings for such a Tomb would wish to die.",
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
  const lines = text.split("\n").map((line) => line.trimEnd().replace(/^\*\s+/, ""));
  const start = lines.findIndex((line) => line.trim() === startLine);
  if (start === -1) throw new Error(`Start line not found: ${startLine}`);

  const end = lines.findIndex((line, index) => index >= start && line.trim() === endLine);
  if (end === -1) throw new Error(`End line not found: ${endLine}`);

  return lines
    .slice(start, end + 1)
    .filter((line) => !/^[IVXLC]+[.]?$/.test(line.trim()))
    .filter(
      (line) =>
        ![
          "L'Allegro.",
          "Lycidas.",
          "Bermudas.",
          "At a solemn Musick.",
          "Eyes and Tears.",
          "Il Penseroso.",
          "On May morning.",
          "On Shakespear. 1630.",
          "On Time.",
          "On a Drop of Dew.",
          "The Coronet.",
          "The Definition of Love.",
          "The Fair Singer.",
          "The Garden.",
        ].includes(line.trim()),
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
