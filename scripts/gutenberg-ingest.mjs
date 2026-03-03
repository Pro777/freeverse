import fs from "node:fs/promises";
import path from "node:path";

const DICKINSON_TEXT_URL = "https://www.gutenberg.org/ebooks/12242.txt.utf-8";
const DICKINSON_SOURCE_URL = "https://www.gutenberg.org/ebooks/12242";

const TARGET_FIRST_LINES = [
  "Hope is the thing with feathers",
  "I'm Nobody! Who are you?",
  "A Bird came down the Walk",
  "I heard a Fly buzz — when I died",
  "Tell all the truth but tell it slant",
  "Wild nights — Wild nights!",
  "The Soul selects her own Society",
  "I felt a Funeral, in my Brain",
  "Success is counted sweetest",
  "There's a certain Slant of light",
  "Because I could not stop for Death",
  "I dwell in Possibility",
  "I'm ceded - I've stopped being Theirs",
  "This is my letter to the World",
  "Much Madness is divinest Sense",
  "Pain — has an Element of Blank",
  "After great pain, a formal feeling comes",
  "I died for Beauty — but was scarce",
  "If I can stop one Heart from breaking",
  "The Brain — is wider than the Sky",
  "The Brain, within its Groove",
  "I'm wife — I've finished that",
  "My life closed twice before its close",
  "A narrow Fellow in the Grass",
  "Apparently with no surprise",
  "A still — Volcano — Life",
  "I reason, Earth is short",
  "The Chariot",
  "I had been hungry, all the Years",
  "I never saw a Moor",
  "A Route of Evanescence",
  "My River runs to thee",
  "As imperceptibly as Grief",
  "The Grass so little has to do",
  "I cannot live with You",
  "I gave myself to Him",
  "Heart, we will forget him",
  "I know that He exists",
  "Parting is all we know of heaven",
  "A Day! Help! Help! Another Day!",
  "The morns are meeker than they were",
  "I taste a liquor never brewed",
  "He fumbles at your Soul",
  "Safe in their Alabaster Chambers",
  "I cannot dance upon my Toes",
  "A Death-blow is a Life-blow to Some",
  "Of all the Sounds despatched abroad",
  "I dreaded that first Robin so",
  "A little Madness in the Spring",
  "To make a prairie it takes a clover and one bee",
];

function normalize(raw) {
  return raw.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");
}

function stripBoilerplate(raw) {
  const start = raw.match(/\*\*\*\s*START OF[\s\S]*?\*\*\*/i);
  const end = raw.match(/\*\*\*\s*END OF[\s\S]*?\*\*\*/i);
  const startIdx = start ? start.index + start[0].length : 0;
  const endIdx = end ? end.index : raw.length;
  return raw.slice(startIdx, endIdx).trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalizeKey(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function extractPoemBlocks(lines) {
  const starts = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/^(?:\d+|[IVXLCDM]+)\.$/.test(lines[i].trim())) starts.push(i);
  }
  const blocks = [];
  for (let s = 0; s < starts.length; s += 1) {
    const start = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1] : lines.length;
    let poem = lines.slice(start + 1, end);

    while (poem.length > 0 && poem[0].trim() === "") poem.shift();
    while (poem.length > 0) {
      const head = poem[0].trim();
      if (head === "") {
        poem.shift();
        continue;
      }
      if (head.startsWith("[")) {
        poem.shift();
        while (poem.length > 0) {
          const done = poem[0].includes("]");
          poem.shift();
          if (done) break;
        }
        continue;
      }
      if (!/[a-z]/.test(head)) {
        poem.shift();
        continue;
      }
      break;
    }
    while (poem.length > 0 && poem[0].trim() === "") poem.shift();
    while (poem.length > 0 && poem[poem.length - 1].trim() === "") poem.pop();

    const nonEmpty = poem.filter((l) => l.trim() !== "").length;
    if (nonEmpty >= 3) {
      blocks.push(poem);
    }
  }
  return blocks;
}

function buildMeta({ slug, title }) {
  return [
    `id: "emily-dickinson/${slug}"`,
    `slug: "${slug}"`,
    'author: "Emily Dickinson"',
    'author_slug: "emily-dickinson"',
    `title: "${title.replace(/"/g, '\\"')}"`,
    "century: 19",
    "text_in_repo: true",
    `text_path: "poems/emily-dickinson/${slug}.txt"`,
    'source_label: "Project Gutenberg"',
    `source_url: "${DICKINSON_SOURCE_URL}"`,
    'public_domain_rationale: "Public domain (author died 1886; distributed by Project Gutenberg as public-domain text)."',
    'collection_title: "Poems by Emily Dickinson, Three Series, Complete"',
    `collection_source_url: "${DICKINSON_SOURCE_URL}"`,
    "featured: false",
    "",
  ].join("\n");
}

async function main() {
  const response = await fetch(DICKINSON_TEXT_URL);
  if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
  const text = stripBoilerplate(normalize(await response.text()));
  const lines = text.split("\n");
  const blocks = extractPoemBlocks(lines);
  if (process.argv.includes("--list")) {
    for (const poem of blocks.slice(0, 140)) {
      console.log(poem[0].trim());
    }
    return;
  }

  const outPoemsDir = path.join("poems", "emily-dickinson");
  const outMetaDir = path.join("meta", "emily-dickinson");
  await fs.mkdir(outPoemsDir, { recursive: true });
  await fs.mkdir(outMetaDir, { recursive: true });

  const existing = new Set(["because-i-could-not-stop-for-death"]);
  let written = 0;
  const used = new Set();
  const targetKeys = TARGET_FIRST_LINES.map(normalizeKey);
  const requiredAll = targetKeys.slice(0, 10);
  const sourceKey = normalizeKey(text);
  const requiredSet = new Set(requiredAll.filter((key) => sourceKey.includes(key)));

  for (const key of targetKeys) {
    const idx = blocks.findIndex((poem, i) => !used.has(i) && normalizeKey(poem[0]) === key);
    if (idx === -1) continue;
    const poem = blocks[idx];
    used.add(idx);
    const title = poem[0].trim();
    const slug = slugify(title);
    if (!slug || existing.has(slug)) continue;
    existing.add(slug);
    await fs.writeFile(path.join(outPoemsDir, `${slug}.txt`), `${poem.join("\n")}\n`, "utf8");
    await fs.writeFile(path.join(outMetaDir, `${slug}.yml`), buildMeta({ slug, title }), "utf8");
    written += 1;
  }

  if (written < 50) {
    for (let i = 0; i < blocks.length && written < 50; i += 1) {
      if (used.has(i)) continue;
      const poem = blocks[i];
      const title = poem[0].trim();
      const slug = slugify(title);
      if (!slug || existing.has(slug)) continue;
      existing.add(slug);
      await fs.writeFile(path.join(outPoemsDir, `${slug}.txt`), `${poem.join("\n")}\n`, "utf8");
      await fs.writeFile(path.join(outMetaDir, `${slug}.yml`), buildMeta({ slug, title }), "utf8");
      written += 1;
    }
  }

  const foundRequired = new Set(blocks.map((poem) => normalizeKey(poem[0])).filter((k) => requiredSet.has(k)));
  if (foundRequired.size !== requiredSet.size) {
    const missing = [...requiredSet].filter((k) => !foundRequired.has(k));
    throw new Error(`Missing required canonical poems (${foundRequired.size}/${requiredSet.size} found): ${missing.join(" | ")}`);
  }

  if (written < 50) {
    throw new Error(`Too few poems extracted (${written}), expected at least 50`);
  }
  console.log(`Generated ${written} poems.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
