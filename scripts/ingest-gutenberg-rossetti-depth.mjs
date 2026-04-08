import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POET = {
  author: "Christina Rossetti",
  author_slug: "christina-rossetti",
  century: 19,
  source_ebook: "16950",
  collection_title: "Goblin Market, The Prince's Progress, and Other Poems",
  titles: [
    { heading: "COUSIN KATE", slug: "cousin-kate", title: "Cousin Kate", published_year: 1862 },
    { heading: "AFTER DEATH", slug: "after-death", title: "After Death", published_year: 1862 },
    {
      heading: "NO, THANK YOU, JOHN",
      slug: "no-thank-you-john",
      title: "No, Thank You, John",
      published_year: 1862,
    },
    { heading: "SHUT OUT", slug: "shut-out", title: "Shut Out", published_year: 1862 },
    { heading: "TWICE", slug: "twice", title: "Twice", published_year: 1866 },
  ],
};

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

function key(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "");
}

function buildMeta(poem) {
  const sourceUrl = `https://www.gutenberg.org/ebooks/${POET.source_ebook}`;
  return yaml.dump(
    {
      id: `${POET.author_slug}/${poem.slug}`,
      slug: poem.slug,
      author: POET.author,
      author_slug: POET.author_slug,
      title: poem.title,
      century: POET.century,
      published_year: poem.published_year,
      text_path: `poems/${POET.author_slug}/${poem.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: sourceUrl,
      public_domain_rationale: `Public domain in the United States: first published ${poem.published_year} (pre-1929); text via Project Gutenberg eBook #${POET.source_ebook}.`,
      collection_title: POET.collection_title,
      collection_source_url: sourceUrl,
    },
    { lineWidth: 1000 },
  );
}

async function main() {
  const poemsDir = path.join("poems", POET.author_slug);
  const metaDir = path.join("meta", POET.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const existingSlugs = new Set(
    (await fs.readdir(poemsDir))
      .filter((file) => file.endsWith(".txt"))
      .map((file) => file.replace(/\.txt$/, "")),
  );

  const response = await fetch(`https://www.gutenberg.org/ebooks/${POET.source_ebook}.txt.utf-8`);
  if (!response.ok) throw new Error(`Failed to fetch ${POET.author} (${response.status})`);

  const lines = stripBoilerplate(normalizeText(await response.text())).split("\n");
  const targetMap = new Map(POET.titles.map((poem) => [key(poem.heading), poem]));
  const hits = [];

  for (let index = 0; index < lines.length; index += 1) {
    const poem = targetMap.get(key(lines[index].trim()));
    if (poem) hits.push({ index, poem });
  }

  const seen = new Set();
  const ordered = hits.filter((hit) => {
    if (seen.has(hit.poem.slug)) return false;
    seen.add(hit.poem.slug);
    return true;
  });

  let created = 0;
  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const nextIndex = index + 1 < ordered.length ? ordered[index + 1].index : lines.length;
    const block = lines.slice(current.index + 1, nextIndex);

    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
    if (block.filter((line) => line.trim() !== "").length < 3) continue;
    if (existingSlugs.has(current.poem.slug)) continue;

    await fs.writeFile(path.join(poemsDir, `${current.poem.slug}.txt`), `${block.join("\n")}\n`, "utf8");
    await fs.writeFile(
      path.join(metaDir, `${current.poem.slug}.yml`),
      buildMeta(current.poem),
      "utf8",
    );
    created += 1;
    console.log(`${POET.author}: created ${current.poem.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
