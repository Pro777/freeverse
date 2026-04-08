import fs from "node:fs/promises";
import path from "node:path";
import yaml from "../site/node_modules/js-yaml/dist/js-yaml.mjs";

const POET = {
  author: "Samuel Taylor Coleridge",
  author_slug: "samuel-taylor-coleridge",
  century: 19,
  source_ebook: "8208",
  collection_title: "The Complete Poetical Works of Samuel Taylor Coleridge, Vol. I",
  targets: [
    {
      heading: "THIS LIME-TREE BOWER MY PRISON",
      slug: "this-lime-tree-bower-my-prison",
      title: "This Lime-Tree Bower My Prison",
      published_year: 1800,
      start_line: "Well, they are gone, and here must I remain,",
      end_line: "No sound is dissonant which tells of Life.",
    },
    {
      heading: "THE NIGHTINGALE",
      slug: "the-nightingale",
      title: "The Nightingale",
      published_year: 1800,
      start_line: "No cloud, no relique of the sunken day",
      end_line: "farewell.",
    },
    {
      heading: "WORK WITHOUT HOPE",
      slug: "work-without-hope",
      title: "Work Without Hope",
      published_year: 1827,
      start_line: "All Nature seems at work. Slugs leave their lair--",
      end_line: "And Hope without an object cannot live.",
    },
    {
      heading: "TO NATURE",
      slug: "to-nature",
      title: "To Nature",
      published_year: 1820,
      start_line: "It may indeed be phantasy: when I",
      end_line: "Even me, the priest of this poor sacrifice.",
    },
    {
      heading: "THE PAINS OF SLEEP",
      slug: "the-pains-of-sleep",
      title: "The Pains of Sleep",
      published_year: 1803,
      start_line: "Ere on my bed my limbs I lay,",
      end_line: "And whom I love, I love indeed.",
    },
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

function buildMeta(target) {
  const sourceUrl = `https://www.gutenberg.org/cache/epub/${POET.source_ebook}/pg${POET.source_ebook}.txt`;
  return yaml.dump(
    {
      id: `${POET.author_slug}/${target.slug}`,
      slug: target.slug,
      author: POET.author,
      author_slug: POET.author_slug,
      title: target.title,
      century: POET.century,
      text_path: `poems/${POET.author_slug}/${target.slug}.txt`,
      text_in_repo: true,
      source_label: "Project Gutenberg",
      source_url: sourceUrl,
      public_domain_rationale: `Public domain in the United States: first published ${target.published_year} (pre-1929); text via Project Gutenberg eBook #${POET.source_ebook}.`,
      collection_title: POET.collection_title,
      collection_source_url: `https://www.gutenberg.org/ebooks/${POET.source_ebook}`,
    },
    { lineWidth: 1000 },
  );
}

function cleanBlock(block) {
  return block.map((line) =>
    line
      .replace("Bur* hear no murmuring: it flows silently,", "But hear no murmuring: it flows silently,")
      .replace("No waste so vacant, but. may well employ", "No waste so vacant, but may well employ"),
  );
}

async function main() {
  const poemsDir = path.join("poems", POET.author_slug);
  const metaDir = path.join("meta", POET.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const response = await fetch(`https://www.gutenberg.org/ebooks/${POET.source_ebook}.txt.utf-8`);
  if (!response.ok) throw new Error(`Failed to fetch ${POET.author} (${response.status})`);

  const lines = stripBoilerplate(normalizeText(await response.text())).split("\n");
  const targetMap = new Map(POET.targets.map((target) => [key(target.heading), target]));
  const hits = new Map();

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].trim();
    const target = targetMap.get(key(heading));
    if (target) hits.set(target.slug, { index, target });
  }

  const ordered = [...hits.values()].sort((a, b) => a.index - b.index);

  let created = 0;
  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const startIndex = lines.findIndex((line, lineIndex) => lineIndex >= current.index && line.trim() === current.target.start_line);
    if (startIndex === -1) continue;
    const endIndex = lines.findIndex(
      (line, lineIndex) => lineIndex >= startIndex && line.trim() === current.target.end_line,
    );
    if (endIndex === -1) continue;
    const block = lines.slice(startIndex, endIndex + 1);

    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
    if (block.filter((line) => line.trim() !== "").length < 3) continue;

    const cleaned = cleanBlock(block);

    await fs.writeFile(path.join(poemsDir, `${current.target.slug}.txt`), `${cleaned.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${current.target.slug}.yml`), buildMeta(current.target), "utf8");
    created += 1;
    console.log(`${POET.author}: created ${current.target.slug}`);
  }

  console.log(`Total created: ${created}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
