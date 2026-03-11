/**
 * Wave 5 ingest: American Romantics and Transcendentalists
 * Issue #49
 *
 * Sources: Project Gutenberg
 * Authors: Longfellow, Holmes Sr., Lowell, Whittier, Poe (additions)
 *
 * TOC-skip strategy: Gutenberg ebooks often have tables of contents with indented poem
 * titles that duplicate the actual section headings. The real headings appear at column 0
 * (no leading whitespace), while TOC entries are indented. This script matches only
 * lines that start at column 0 (i.e. lines[i].trimStart() === lines[i]).
 *
 * Special cases handled via manual extraction:
 * - Old Ironsides (Holmes Vol 1): no column-0 heading in ebook 7388
 * - Lowell (ebook 17119): column-0 TOC collides with column-0 body headings (annotated
 *   scholarly edition with no period distinction in TOC); footnotes and inline line numbers
 *   also need stripping. Handled by fetchAndExtractLowell().
 * - Barbara Frietchie (Whittier ebook 9580): editorial note precedes poem text after the
 *   column-0 heading. Handled by manual extraction with known line offset.
 */

import fs from "node:fs/promises";
import path from "node:path";

const POETS = [
  {
    author: "Henry Wadsworth Longfellow",
    author_slug: "henry-wadsworth-longfellow",
    death_year: 1882,
    century: 19,
    source_ebook: "1365",
    collection_title: "The Complete Poetical Works of Henry Wadsworth Longfellow",
    targets: [
      "A PSALM OF LIFE.",
      "EXCELSIOR",
      "HIAWATHA'S CHILDHOOD",
      "PAUL REVERE'S RIDE.",
    ],
  },
  {
    // Note: Old Ironsides is added manually below (no column-0 heading in this ebook).
    author: "Oliver Wendell Holmes",
    author_slug: "oliver-wendell-holmes-sr",
    death_year: 1894,
    century: 19,
    source_ebook: "7388",
    collection_title: "The Poetical Works of Oliver Wendell Holmes — Volume 01: Earlier Poems",
    targets: [
      "THE LAST LEAF",
    ],
  },
  {
    author: "Oliver Wendell Holmes",
    author_slug: "oliver-wendell-holmes-sr",
    death_year: 1894,
    century: 19,
    source_ebook: "7393",
    collection_title: "The Poetical Works of Oliver Wendell Holmes — Volume 06",
    targets: [
      "THE CHAMBERED NAUTILUS",
      "CONTENTMENT",
    ],
  },
  {
    // Note: Barbara Frietchie is extracted manually below (editorial note precedes poem).
    // Other Whittier poems from 9574 work fine with column-0 detection.
    author: "John Greenleaf Whittier",
    author_slug: "john-greenleaf-whittier",
    death_year: 1892,
    century: 19,
    source_ebook: "9574",
    collection_title:
      "Poems of Nature, Poems Subjective and Reminiscent and Religious Poems, Complete",
    targets: [
      "SNOW-BOUND. A WINTER IDYL.",
      "IN SCHOOL-DAYS.",
    ],
  },
  {
    author: "Edgar Allan Poe",
    author_slug: "edgar-allan-poe",
    death_year: 1849,
    century: 19,
    source_ebook: "10031",
    collection_title: "The Complete Poetical Works of Edgar Allan Poe",
    targets: [
      "TO HELEN.",
      "ELDORADO.",
      "THE CITY IN THE SEA.",
      "THE SLEEPER",
      "THE CONQUEROR WORM.",
      "DREAMLAND.",
    ],
  },
];

// Minimum non-blank lines in a block for it to be considered real poem content
const MIN_POEM_LINES = 8;

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
  return value.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prettyTitle(raw) {
  const cleaned = raw.replace(/\.$/, "").trim();
  return cleaned
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bOf\b/g, "of")
    .replace(/\bThe\b/g, "the")
    .replace(/\bA\b/g, "a")
    .replace(/\bAnd\b/g, "and")
    .replace(/\bIn\b/g, "in")
    .replace(/\bTo\b/g, "to")
    .replace(/\bI\b/g, "I")
    .replace(/^([a-z])/, (m) => m.toUpperCase());
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

function countNonBlank(lines) {
  return lines.filter((l) => l.trim() !== "").length;
}

/**
 * Returns true if this line is a valid poem-heading match:
 * - The normalized key of the trimmed line matches the target key
 * - The line starts at column 0 (no leading whitespace) — this filters out TOC entries
 */
function isColumnZeroMatch(rawLine, targetK) {
  // Must start at column 0 (no leading spaces/tabs)
  if (rawLine !== rawLine.trimStart()) return false;
  return key(rawLine.trim()) === targetK;
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

  const response = await fetch(
    `https://www.gutenberg.org/ebooks/${poet.source_ebook}.txt.utf-8`,
    { redirect: "follow" },
  );
  if (!response.ok)
    throw new Error(
      `Failed to fetch ${poet.author} ebook ${poet.source_ebook} (${response.status})`,
    );
  const text = stripBoilerplate(normalizeText(await response.text()));
  const lines = text.split("\n");

  // Build key → target map
  const targetKeyMap = new Map(poet.targets.map((t) => [key(t), t]));

  // Collect hits: ONLY column-0 lines that match targets
  const hitsByTarget = new Map(poet.targets.map((t) => [t, []]));

  for (let i = 0; i < lines.length; i += 1) {
    const tk = key(lines[i].trim());
    if (targetKeyMap.has(tk) && isColumnZeroMatch(lines[i], tk)) {
      hitsByTarget.get(targetKeyMap.get(tk)).push(i);
    }
  }

  // For each target, find the first hit with a large enough block.
  // Block end = start of next column-0 target hit (of any target) after this hit.
  // Build sorted list of all column-0 hits for block-boundary determination.
  const allCol0Hits = [];
  for (const [, hits] of hitsByTarget) {
    for (const h of hits) allCol0Hits.push(h);
  }
  allCol0Hits.sort((a, b) => a - b);

  function nextHitAfter(lineNum) {
    for (const h of allCol0Hits) {
      if (h > lineNum) return h;
    }
    return lines.length;
  }

  const bestHits = new Map(); // target → line index
  const missed = [];
  for (const target of poet.targets) {
    const hits = hitsByTarget.get(target);
    let found = false;
    for (const hitLine of hits) {
      const blockEnd = nextHitAfter(hitLine);
      const block = lines.slice(hitLine + 1, blockEnd);
      while (block.length > 0 && block[0].trim() === "") block.shift();
      while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
      if (countNonBlank(block) >= MIN_POEM_LINES) {
        bestHits.set(target, hitLine);
        found = true;
        break;
      }
    }
    if (!found) missed.push(target);
  }

  // Sort best hits by line
  const ordered = [...bestHits.entries()]
    .map(([target, line]) => ({ target, line }))
    .sort((a, b) => a.line - b.line);

  let created = 0;
  for (let i = 0; i < ordered.length; i += 1) {
    const current = ordered[i];
    const blockEnd = i + 1 < ordered.length ? ordered[i + 1].line : lines.length;
    const block = lines.slice(current.line + 1, blockEnd);
    while (block.length > 0 && block[0].trim() === "") block.shift();
    while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();

    if (countNonBlank(block) < MIN_POEM_LINES) {
      console.log(`  [skip-thin] ${current.target}`);
      continue;
    }

    const slug = slugify(current.target);
    if (!slug || existingSlugs.has(slug)) {
      if (existingSlugs.has(slug)) console.log(`  [skip] ${slug} already exists`);
      continue;
    }
    existingSlugs.add(slug);
    const title = prettyTitle(current.target);
    await fs.writeFile(path.join(poemsDir, `${slug}.txt`), `${block.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(metaDir, `${slug}.yml`), buildMeta(poet, slug, title), "utf8");
    created += 1;
    console.log(`  [created] ${slug}`);
  }
  return { created, found: ordered.length, missed };
}

/**
 * Write a poem file and meta file directly from provided text.
 * Used for poems whose headings cannot be reliably located by the column-0 strategy.
 */
async function writeManual(poet, slug, title, poemText) {
  const poemsDir = path.join("poems", poet.author_slug);
  const metaDir = path.join("meta", poet.author_slug);
  await fs.mkdir(poemsDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });

  const poemPath = path.join(poemsDir, `${slug}.txt`);
  const metaPath = path.join(metaDir, `${slug}.yml`);

  try {
    await fs.access(poemPath);
    console.log(`  [skip] ${slug} already exists`);
    return false;
  } catch {
    // file does not exist — proceed
  }

  await fs.writeFile(poemPath, poemText.trimEnd() + "\n", "utf8");
  await fs.writeFile(metaPath, buildMeta(poet, slug, title), "utf8");
  console.log(`  [created-manual] ${slug}`);
  return true;
}

/**
 * Strip footnote and editorial note blocks from lines of Project Gutenberg ebook 17119
 * (Lowell, annotated edition).
 *
 * Two block types are stripped:
 *   1. Footnote blocks: start with /^\[Footnote \d+:/ and end at a line closing with "]"
 *   2. Editorial note blocks: start with /^\[(?!Footnote)/ (e.g. "[In the year 1844,")
 *      and end at a line closing with "]"
 *
 * Also strips inline footnote reference numbers [N] and trailing line numbers from verse lines.
 */
function stripLowell17119Footnotes(lines) {
  const out = [];
  let inBlock = false; // true when inside a [Footnote ...] or editorial [...] block
  for (let i = 0; i < lines.length; i += 1) {
    const s = lines[i].trim();
    // Detect start of a bracketed block: line starts with "[" (not an inline ref like [17])
    // Inline refs are short: [N] on a verse line. Block starts have more text after "[".
    if (!inBlock && /^\[.{5,}/.test(s)) {
      inBlock = true;
      // If the block also closes on the same line, skip and move on
      if (s.endsWith("]")) {
        inBlock = false;
      }
      continue;
    }
    if (inBlock) {
      if (s.endsWith("]")) {
        inBlock = false;
        continue;
      }
      // Blank line followed by indented verse ends the block
      if (s === "") {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j += 1;
        if (j < lines.length && /^\s{4}/.test(lines[j]) && !/^\[.{5,}/.test(lines[j].trim())) {
          inBlock = false;
          out.push("");
        }
        continue;
      }
      continue;
    }
    // Strip inline [N] refs and trailing line numbers from verse lines
    let l = lines[i].replace(/\[\d+\]/g, "");
    l = l.replace(/\s+\d{1,3}\s*$/, "");
    out.push(l);
  }
  return out;
}

/**
 * Extract a poem from cleaned lines between startTitle and endTitle (exclusive).
 * Trims leading and trailing blank lines.
 */
function extractBetweenHeadings(lines, startTitle, endTitle) {
  let inPoem = false;
  const result = [];
  for (const line of lines) {
    const s = line.trim();
    if (s === startTitle) { inPoem = true; continue; }
    if (inPoem && s === endTitle) break;
    if (!inPoem) continue;
    result.push(line);
  }
  while (result.length > 0 && result[0].trim() === "") result.shift();
  while (result.length > 0 && result[result.length - 1].trim() === "") result.pop();
  return result;
}

/**
 * Fetch Lowell ebook 17119 (annotated scholarly edition), strip footnotes and inline
 * line numbers, and return clean poem texts for the three target poems.
 */
async function fetchAndExtractLowell() {
  const response = await fetch(
    "https://www.gutenberg.org/ebooks/17119.txt.utf-8",
    { redirect: "follow" },
  );
  if (!response.ok) throw new Error(`Failed to fetch Lowell ebook 17119 (${response.status})`);
  const raw = stripBoilerplate(normalizeText(await response.text()));
  const lines = stripLowell17119Footnotes(raw.split("\n"));

  // The Vision of Sir Launfal: poem begins at "PRELUDE TO PART FIRST." and ends just
  // before "AN INDIAN-SUMMER REVERIE." The heading "THE VISION OF SIR LAUNFAL" appears
  // in the TOC (column 0, no period) and in the body (column 0, no period) — both at
  // column 0, so we use the known subsequent structure instead.
  const vision = extractBetweenHeadings(lines, "PRELUDE TO PART FIRST.", "AN INDIAN-SUMMER REVERIE.");

  // The First Snow-Fall: heading "THE FIRST SNOW-FALL." (body, with period),
  // next heading "THE OAK."
  const snowFall = extractBetweenHeadings(lines, "THE FIRST SNOW-FALL.", "THE OAK.");

  // The Present Crisis: heading "THE PRESENT CRISIS." (body, with period),
  // next heading "AL FRESCO."
  const presentCrisis = extractBetweenHeadings(lines, "THE PRESENT CRISIS.", "AL FRESCO.");

  return { vision, snowFall, presentCrisis };
}

/**
 * Fetch Whittier ebook 9580 and extract Barbara Frietchie's poem text.
 * The heading "BARBARA FRIETCHIE." is followed by a prose editorial note before the poem.
 * The poem stanzas begin with "Up from the meadows rich with corn," — find that line
 * and extract from there to the next all-caps heading.
 */
async function fetchAndExtractBarbaraFrietchie() {
  const response = await fetch(
    "https://www.gutenberg.org/ebooks/9580.txt.utf-8",
    { redirect: "follow" },
  );
  if (!response.ok)
    throw new Error(`Failed to fetch Whittier ebook 9580 (${response.status})`);
  const raw = stripBoilerplate(normalizeText(await response.text()));
  const lines = raw.split("\n");

  // Find the first stanza line of the poem (after the editorial note)
  let poemStart = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "Up from the meadows rich with corn,") {
      poemStart = i;
      break;
    }
  }
  if (poemStart === -1) throw new Error("Could not find Barbara Frietchie poem start");

  // Find the next all-caps heading after the poem (signals end of poem)
  let poemEnd = lines.length;
  for (let i = poemStart + 1; i < lines.length; i += 1) {
    const s = lines[i].trim();
    // All-caps heading at column 0, at least 4 chars
    if (s.length >= 4 && s === s.toUpperCase() && /^[A-Z]/.test(s) && lines[i] === lines[i].trimStart()) {
      poemEnd = i;
      break;
    }
  }

  const block = lines.slice(poemStart, poemEnd);
  while (block.length > 0 && block[block.length - 1].trim() === "") block.pop();
  return block;
}

async function main() {
  let createdTotal = 0;

  for (const poet of POETS) {
    console.log(`\n${poet.author} (ebook ${poet.source_ebook}):`);
    const result = await ingestPoet(poet);
    createdTotal += result.created;
    console.log(`  => created ${result.created} (found ${result.found}/${poet.targets.length})`);
    if (result.missed.length > 0) {
      console.log(`  => missed: ${result.missed.join(", ")}`);
    }
  }

  // ------------------------------------------------------------------
  // Manual entry: Old Ironsides (Holmes) — ebook 7388 has no bare
  // column-0 heading; the poem follows an editorial note introduced by
  // "1830-1836 OLD IRONSIDES" (indented, with date prefix).
  // Text taken directly from Project Gutenberg ebook 7388.
  // ------------------------------------------------------------------
  console.log("\nOliver Wendell Holmes — Old Ironsides (manual):");
  const holmesPoet = {
    author: "Oliver Wendell Holmes",
    author_slug: "oliver-wendell-holmes-sr",
    death_year: 1894,
    century: 19,
    source_ebook: "7388",
    collection_title: "The Poetical Works of Oliver Wendell Holmes — Volume 01: Earlier Poems",
  };
  const oldIronsidesPoemText = `AY, tear her tattered ensign down!
Long has it waved on high,
And many an eye has danced to see
That banner in the sky;
Beneath it rung the battle shout,
And burst the cannon's roar;--
The meteor of the ocean air
Shall sweep the clouds no more.

Her deck, once red with heroes' blood,
Where knelt the vanquished foe,
When winds were hurrying o'er the flood,
And waves were white below,
No more shall feel the victor's tread,
Or know the conquered knee;--
The harpies of the shore shall pluck
The eagle of the sea!

Oh, better that her shattered hulk
Should sink beneath the wave;
Her thunders shook the mighty deep,
And there should be her grave;
Nail to the mast her holy flag,
Set every threadbare sail,
And give her to the god of storms,
The lightning and the gale!`;

  const createdIronsides = await writeManual(holmesPoet, "old-ironsides", "Old Ironsides", oldIronsidesPoemText);
  if (createdIronsides) createdTotal += 1;

  // ------------------------------------------------------------------
  // Lowell (ebook 17119) — annotated scholarly edition with column-0 TOC
  // colliding with column-0 body headings and embedded footnotes/line numbers.
  // Fetch, strip annotations, and extract each poem via heading boundaries.
  // ------------------------------------------------------------------
  console.log("\nJames Russell Lowell (ebook 17119) — manual extraction:");
  const lowellPoet = {
    author: "James Russell Lowell",
    author_slug: "james-russell-lowell",
    death_year: 1891,
    century: 19,
    source_ebook: "17119",
    collection_title: "The Vision of Sir Launfal and Other Poems",
  };
  const { vision, snowFall, presentCrisis } = await fetchAndExtractLowell();
  const lowellPoems = [
    { slug: "the-vision-of-sir-launfal", title: "The Vision of Sir Launfal", lines: vision },
    { slug: "the-first-snow-fall", title: "The First Snow-Fall", lines: snowFall },
    { slug: "the-present-crisis", title: "The Present Crisis", lines: presentCrisis },
  ];
  for (const { slug, title, lines } of lowellPoems) {
    const created = await writeManual(lowellPoet, slug, title, lines.join("\n"));
    if (created) createdTotal += 1;
  }

  // ------------------------------------------------------------------
  // Barbara Frietchie (Whittier, ebook 9580) — editorial note precedes poem text.
  // Fetch and extract poem starting from first stanza line.
  // ------------------------------------------------------------------
  console.log("\nJohn Greenleaf Whittier — Barbara Frietchie (manual extraction):");
  const whittierPoet9580 = {
    author: "John Greenleaf Whittier",
    author_slug: "john-greenleaf-whittier",
    death_year: 1892,
    century: 19,
    source_ebook: "9580",
    collection_title: "Anti-Slavery Poems and Songs of Labor and Reform, Complete",
  };
  const barbaraLines = await fetchAndExtractBarbaraFrietchie();
  const createdBarbara = await writeManual(
    whittierPoet9580,
    "barbara-frietchie",
    "Barbara Frietchie",
    barbaraLines.join("\n"),
  );
  if (createdBarbara) createdTotal += 1;

  console.log(`\nTotal created: ${createdTotal}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
