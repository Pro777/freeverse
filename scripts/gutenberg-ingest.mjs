import fs from "node:fs/promises";
import path from "node:path";

const TEXT_URL = "https://www.gutenberg.org/ebooks/1322.txt.utf-8";
const SOURCE_URL = "https://www.gutenberg.org/ebooks/1322";
const AUTHOR = "Walt Whitman";
const AUTHOR_SLUG = "walt-whitman";
const COLLECTION_TITLE = "Leaves of Grass";

const TARGET_TITLES = [
  "SONG OF MYSELF",
  "I SING THE BODY ELECTRIC",
  "A WOMAN WAITS FOR ME",
  "SPONTANEOUS ME",
  "CROSSING BROOKLYN FERRY",
  "SONG OF THE OPEN ROAD",
  "OUT OF THE CRADLE ENDLESSLY ROCKING",
  "AS I EBB'D WITH THE OCEAN OF LIFE",
  "WHEN LILACS LAST IN THE DOORYARD BLOOM'D",
  "PASSAGE TO INDIA",
  "PRAYER OF COLUMBUS",
  "BY BLUE ONTARIO'S SHORE",
  "TO A LOCOMOTIVE IN WINTER",
  "THE WOUND-DRESSER",
  "VIGIL STRANGE I KEPT ON THE FIELD ONE NIGHT",
  "RECONCILIATION",
  "O ME! O LIFE!",
  "THIS DUST WAS ONCE THE MAN",
  "ONE'S-SELF I SING",
  "AS I PONDER'D IN SILENCE",
  "TO FOREIGN LANDS",
  "TO A HISTORIAN",
  "TO THEE OLD CAUSE",
  "EIDOLONS",
  "BEGINNING MY STUDIES",
  "BEGINNERS",
  "TO THE STATES",
  "ON JOURNEYS THROUGH THE STATES",
  "ME IMPERTURBE",
  "SAVANTISM",
  "THE SHIP STARTING",
  "SONG OF THE BROAD-AXE",
  "GOOD-BYE MY FANCY",
];

function normalizeText(value) {
  return value.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
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

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bI\b/g, "I");
}

function buildMeta(slug, title) {
  return [
    `id: "${AUTHOR_SLUG}/${slug}"`,
    `slug: "${slug}"`,
    `author: "${AUTHOR}"`,
    `author_slug: "${AUTHOR_SLUG}"`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    "century: 19",
    "text_in_repo: true",
    `text_path: "poems/${AUTHOR_SLUG}/${slug}.txt"`,
    'source_label: "Project Gutenberg"',
    `source_url: "${SOURCE_URL}"`,
    'public_domain_rationale: "Public domain (author died 1892; distributed by Project Gutenberg as public-domain text)."',
    `collection_title: "${COLLECTION_TITLE}"`,
    `collection_source_url: "${SOURCE_URL}"`,
    "featured: false",
    "",
  ].join("\n");
}

async function main() {
  const poemsDir = path.join("poems", AUTHOR_SLUG);
  const metaDir = path.join("meta", AUTHOR_SLUG);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const existingSlugs = new Set(
    (await fs.readdir(poemsDir))
      .filter((name) => name.endsWith(".txt"))
      .map((name) => name.replace(/\.txt$/, "")),
  );

  const response = await fetch(TEXT_URL);
  if (!response.ok) throw new Error(`Failed to fetch source (${response.status})`);
  const body = stripBoilerplate(normalizeText(await response.text()));
  const lines = body.split("\n");

  const titleKeyToTitle = new Map(TARGET_TITLES.map((title) => [key(title), title]));
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const k = key(line);
    if (titleKeyToTitle.has(k)) {
      hits.push({ index: i, title: titleKeyToTitle.get(k) });
    }
  }

  const uniqueByTitle = new Map();
  for (const hit of hits) {
    if (!uniqueByTitle.has(hit.title)) uniqueByTitle.set(hit.title, hit);
  }
  const ordered = [...uniqueByTitle.values()].sort((a, b) => a.index - b.index);
  if (ordered.length < 20) {
    throw new Error(`Too few titles found (${ordered.length})`);
  }

  let created = 0;
  for (let i = 0; i < ordered.length; i += 1) {
    const current = ordered[i];
    const nextIndex = i + 1 < ordered.length ? ordered[i + 1].index : lines.length;
    let poem = lines.slice(current.index + 1, nextIndex);
    while (poem.length > 0 && poem[0].trim() === "") poem.shift();
    while (poem.length > 0 && poem[poem.length - 1].trim() === "") poem.pop();
    if (poem.filter((line) => line.trim() !== "").length < 4) continue;

    const slug = slugify(current.title);
    if (!slug || existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);

    const displayTitle = titleCase(current.title);
    await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${poem.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(slug, displayTitle), "utf8");
    created += 1;
  }

  if (created < 20) {
    throw new Error(`Generated too few poems (${created})`);
  }
  console.log(`Generated ${created} new Whitman poems.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
