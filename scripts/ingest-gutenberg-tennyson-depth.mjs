import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const SOURCE = {
  author: "Alfred Lord Tennyson",
  author_slug: "alfred-tennyson",
  century: 19,
  source_ebook: "8601",
  collection_title: "The Early Poems of Alfred Lord Tennyson",
};

const POEMS = [
  {
    slug: "the-death-of-the-old-year",
    title: "The Death of the Old Year",
    published_year: 1833,
    start_line: "Full knee-deep lies the winter snow,",
    end_line: "A new face at the door.",
  },
  {
    slug: "lady-clara-vere-de-vere",
    title: "Lady Clara Vere de Vere",
    published_year: 1842,
    start_line: "Lady Clara Vere de Vere,",
    end_line: "And let the foolish yoeman go.",
  },
  {
    slug: "sir-galahad",
    title: "Sir Galahad",
    published_year: 1842,
    start_line: "My good blade carves the casques of men,",
    end_line: "Until I find the holy Grail.",
  },
  {
    slug: "the-beggar-maid",
    title: "The Beggar Maid",
    published_year: 1842,
    start_line: "Her arms across her breast she laid;",
    end_line: "“This beggar maid shall be my queen!”",
  },
  {
    slug: "the-lady-of-shalott",
    title: "The Lady of Shalott",
    published_year: 1833,
    start_line: "On either side the river lie",
    end_line: "The Lady of Shalott”.",
  },
];

function normalizeText(raw) {
  return raw.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
}

function stripBoilerplate(raw) {
  const start = raw.match(/\*\*\*\s*START OF[\s\S]*?\*\*\*/i);
  const end = raw.match(/\*\*\*\s*END OF[\s\S]*?\*\*\*/i);
  const startIdx = start ? start.index + start[0].length : 0;
  const endIdx = end ? end.index : raw.length;
  return raw.slice(startIdx, endIdx).trim();
}

function normalizeLineForMatch(line) {
  return line.replace(/\[\d+\]/g, "").trim();
}

function cleanLine(line) {
  return line.replace(/\[\d+\]/g, "");
}

function buildMeta(poem) {
  const sourceUrl = `https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}`;
  return yaml.dump(
    {
      id: `${SOURCE.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: SOURCE.author,
      author_slug: SOURCE.author_slug,
      title: poem.title,
      century: SOURCE.century,
      text_path: `poems/${SOURCE.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: sourceUrl,
      public_domain_rationale:
        `Public domain in the United States: first published ${poem.published_year} ` +
        `(pre-1929); text via Project Gutenberg eBook #${SOURCE.source_ebook}.`,
      collection_title: SOURCE.collection_title,
      collection_source_url: sourceUrl,
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  const poemsDir = path.join("poems", SOURCE.author_slug);
  const metaDir = path.join("meta", SOURCE.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const response = await fetch(`https://www.gutenberg.org/ebooks/${SOURCE.source_ebook}.txt.utf-8`);
  if (!response.ok) throw new Error(`Failed to fetch ${SOURCE.author} (${response.status})`);
  const lines = stripBoilerplate(normalizeText(await response.text())).split("\n");

  let created = 0;
  for (const poem of POEMS) {
    const start = lines.findIndex((line) => normalizeLineForMatch(line) === poem.start_line);
    if (start === -1) throw new Error(`Start line not found: ${poem.start_line}`);

    const end = lines.findIndex(
      (line, index) => index >= start && normalizeLineForMatch(line) === poem.end_line,
    );
    if (end === -1) throw new Error(`End line not found: ${poem.end_line}`);

    const text = lines
      .slice(start, end + 1)
      .map(cleanLine)
      .join("\n")
      .trim();

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
    console.log(`${SOURCE.author}: ${existed ? "updated" : "created"} ${poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
