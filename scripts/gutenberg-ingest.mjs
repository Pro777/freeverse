import fs from "node:fs/promises";
import path from "node:path";

const POETS = [
  {
    author: "William Blake",
    author_slug: "william-blake",
    death_year: 1827,
    century: 18,
    source_ebook: "1934",
    collection_title: "Songs of Innocence and of Experience",
    targets: [
      "THE LAMB",
      "THE TIGER",
      "LONDON",
      "THE CHIMNEY SWEEPER",
      "HOLY THURSDAY",
      "INFANT JOY",
      "A POISON TREE",
      "THE SICK ROSE",
    ],
  },
  {
    author: "John Keats",
    author_slug: "john-keats",
    death_year: 1821,
    century: 19,
    source_ebook: "23684",
    collection_title: "Poems by John Keats",
    targets: [
      "ODE TO A NIGHTINGALE",
      "ODE ON A GRECIAN URN",
      "TO AUTUMN",
      "BRIGHT STAR, WOULD I WERE STEDFAST AS THOU ART",
      "LA BELLE DAME SANS MERCI",
      "ON FIRST LOOKING INTO CHAPMAN'S HOMER",
      "WHEN I HAVE FEARS THAT I MAY CEASE TO BE",
      "ON THE SEA",
    ],
  },
  {
    author: "Percy Bysshe Shelley",
    author_slug: "percy-bysshe-shelley",
    death_year: 1822,
    century: 19,
    source_ebook: "4800",
    collection_title: "The Complete Poetical Works of Percy Bysshe Shelley",
    targets: [
      "OZYMANDIAS",
      "ODE TO THE WEST WIND",
      "TO A SKYLARK",
      "MUSIC, WHEN SOFT VOICES DIE",
      "LOVE'S PHILOSOPHY",
      "MUTABILITY",
      "THE INDIAN SERENADE",
      "TO NIGHT",
    ],
  },
  {
    author: "Edgar Allan Poe",
    author_slug: "edgar-allan-poe",
    death_year: 1849,
    century: 19,
    source_ebook: "10031",
    collection_title: "The Raven and Other Poems",
    targets: [
      "THE RAVEN",
      "ANNABEL LEE",
      "ALONE",
      "A DREAM WITHIN A DREAM",
      "ULALUME",
      "TO HELEN",
      "THE BELLS",
      "LENORE",
    ],
  },
  {
    author: "William Wordsworth",
    author_slug: "william-wordsworth",
    death_year: 1850,
    century: 18,
    source_ebook: "8774",
    collection_title: "Lyrical Ballads and Other Poems",
    targets: [
      "LINES COMPOSED A FEW MILES ABOVE TINTERN ABBEY",
      "I WANDERED LONELY AS A CLOUD",
      "COMPOSED UPON WESTMINSTER BRIDGE, SEPTEMBER 3, 1802",
      "THE WORLD IS TOO MUCH WITH US",
      "IT IS A BEAUTEOUS EVENING, CALM AND FREE",
      "SHE DWELT AMONG THE UNTRODDEN WAYS",
      "MY HEART LEAPS UP",
      "ODE: INTIMATIONS OF IMMORTALITY",
    ],
  },
  {
    author: "George Gordon Byron",
    author_slug: "george-gordon-byron",
    death_year: 1824,
    century: 19,
    source_ebook: "21811",
    collection_title: "Byron: Selected Poetry",
    targets: [
      "SHE WALKS IN BEAUTY",
      "WHEN WE TWO PARTED",
      "SO, WE'LL GO NO MORE A ROVING",
      "DARKNESS",
      "THE DESTRUCTION OF SENNACHERIB",
      "ON THIS DAY I COMPLETE MY THIRTY-SIXTH YEAR",
      "PROMETHEUS",
      "STANZAS FOR MUSIC",
    ],
  },
  {
    author: "Alfred Lord Tennyson",
    author_slug: "alfred-tennyson",
    death_year: 1892,
    century: 19,
    source_ebook: "8601",
    collection_title: "Poems by Alfred, Lord Tennyson",
    targets: [
      "ULYSSES",
      "THE CHARGE OF THE LIGHT BRIGADE",
      "CROSSING THE BAR",
      "BREAK, BREAK, BREAK",
      "THE LOTOS-EATERS",
      "MARIANA",
      "TEARS, IDLE TEARS",
      "THE EAGLE",
    ],
  },
  {
    author: "Christina Rossetti",
    author_slug: "christina-rossetti",
    death_year: 1894,
    century: 19,
    source_ebook: "16950",
    collection_title: "Goblin Market, The Prince's Progress, and Other Poems",
    targets: [
      "GOBLIN MARKET",
      "REMEMBER",
      "WHEN I AM DEAD, MY DEAREST",
      "SONG",
      "AMOR MUNDI",
      "UP-HILL",
      "A BIRTHDAY",
      "ECHO",
    ],
  },
  {
    author: "Elizabeth Barrett Browning",
    author_slug: "elizabeth-barrett-browning",
    death_year: 1861,
    century: 19,
    source_ebook: "2002",
    collection_title: "Sonnets from the Portuguese",
    targets: ["1", "2", "6", "14", "21", "28", "32", "43"],
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

function prettyTitle(raw) {
  return raw
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bI\b/g, "I");
}

function buildMeta(poet, slug, title) {
  const source_url = `https://www.gutenberg.org/ebooks/${poet.source_ebook}`;
  return [
    `id: "${poet.author_slug}/${slug}"`,
    `slug: "${slug}"`,
    `author: "${poet.author}"`,
    `author_slug: "${poet.author_slug}"`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `century: ${poet.century}`,
    "text_in_repo: true",
    `text_path: "poems/${poet.author_slug}/${slug}.txt"`,
    'source_label: "Project Gutenberg"',
    `source_url: "${source_url}"`,
    `public_domain_rationale: "Public domain (author died ${poet.death_year}; distributed by Project Gutenberg as public-domain text)."`,
    `collection_title: "${poet.collection_title}"`,
    `collection_source_url: "${source_url}"`,
    "featured: false",
    "",
  ].join("\n");
}

async function ingestPoet(poet) {
  const poemsDir = path.join("poems", poet.author_slug);
  const metaDir = path.join("meta", poet.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const existingSlugs = new Set(
    (await fs.readdir(poemsDir))
      .filter((f) => f.endsWith(".txt"))
      .map((f) => f.replace(/\.txt$/, "")),
  );

  const response = await fetch(`https://www.gutenberg.org/ebooks/${poet.source_ebook}.txt.utf-8`);
  if (!response.ok) throw new Error(`Failed to fetch ${poet.author} (${response.status})`);
  const text = stripBoilerplate(normalizeText(await response.text()));
  const lines = text.split("\n");

  const targetKeys = new Map(poet.targets.map((t) => [key(t), t]));
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const k = key(lines[i].trim());
    if (targetKeys.has(k)) hits.push({ index: i, target: targetKeys.get(k), raw: lines[i].trim() });
  }

  const byTarget = new Map();
  for (const hit of hits) {
    if (!byTarget.has(hit.target)) byTarget.set(hit.target, hit);
  }
  const ordered = [...byTarget.values()].sort((a, b) => a.index - b.index);
  if (ordered.length === 0) return { created: 0, found: 0 };

  let created = 0;
  for (let i = 0; i < ordered.length; i += 1) {
    const current = ordered[i];
    const nextIndex = i + 1 < ordered.length ? ordered[i + 1].index : lines.length;
    const block = lines.slice(current.index + 1, nextIndex);
    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
    if (block.filter((line) => line.trim() !== "").length < 3) continue;

    const slug = slugify(current.target);
    if (!slug || existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);
    const title = prettyTitle(current.target);
    await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${block.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(poet, slug, title), "utf8");
    created += 1;
  }
  return { created, found: ordered.length };
}

function toRoman(n) {
  const vals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let x = n;
  for (const [v, s] of vals) {
    while (x >= v) {
      out += s;
      x -= v;
    }
  }
  return out;
}

async function ingestEbb(poet) {
  const poemsDir = path.join("poems", poet.author_slug);
  const metaDir = path.join("meta", poet.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  const existingSlugs = new Set(
    (await fs.readdir(poemsDir))
      .filter((f) => f.endsWith(".txt"))
      .map((f) => f.replace(/\.txt$/, "")),
  );

  const response = await fetch(`https://www.gutenberg.org/ebooks/${poet.source_ebook}.txt.utf-8`);
  if (!response.ok) throw new Error(`Failed to fetch ${poet.author} (${response.status})`);
  const lines = stripBoilerplate(normalizeText(await response.text())).split("\n");

  const starts = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*[IVXLCDM]+\.?\s*$/.test(lines[i])) starts.push(i);
  }
  const wanted = new Set(poet.targets.map((n) => Number(n)));
  let created = 0;
  let found = 0;
  for (const num of wanted) {
    const roman = toRoman(num);
    const idx = lines.findIndex((line) => line.trim() === roman || line.trim() === `${roman}.`);
    if (idx === -1) continue;
    found += 1;
    const next = starts.find((s) => s > idx) ?? lines.length;
    const block = lines.slice(idx + 1, next);
    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
    if (block.filter((l) => l.trim() !== "").length < 3) continue;
    const slug = `sonnet-${String(num).padStart(2, "0")}`;
    if (existingSlugs.has(slug)) continue;
    existingSlugs.add(slug);
    const title = `Sonnet ${num}`;
    await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${block.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(poet, slug, title), "utf8");
    created += 1;
  }
  return { created, found };
}

async function main() {
  let createdTotal = 0;
  for (const poet of POETS) {
    const result =
      poet.author_slug === "elizabeth-barrett-browning" ? await ingestEbb(poet) : await ingestPoet(poet);
    createdTotal += result.created;
    console.log(`${poet.author}: created ${result.created} (found ${result.found}/${poet.targets.length})`);
  }
  console.log(`Total created: ${createdTotal}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
