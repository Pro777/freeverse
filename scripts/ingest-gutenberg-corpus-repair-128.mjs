import fs from "node:fs/promises";

const SPECS = [
  {
    ebookId: "8601",
    path: "poems/alfred-tennyson/break-break-break.txt",
    start: "Break, break, break,",
    end: "Will never come back to me.",
    occurrence: 0,
  },
  {
    ebookId: "8601",
    path: "poems/alfred-tennyson/mariana.txt",
    start: "With blackest moss the flower-plots",
    end: "O God, that I were dead!",
  },
  {
    ebookId: "8601",
    path: "poems/alfred-tennyson/the-lotos-eaters.txt",
    start: "“Courage!” he said, and pointed toward the land,",
    end: "Oh rest ye, brother mariners, we will not wander more.[14]",
  },
  {
    ebookId: "8601",
    path: "poems/alfred-tennyson/ulysses.txt",
    start: "It little profits that an idle king,",
    end: "To strive, to seek, to find, and not to yield.",
  },
  {
    ebookId: "16950",
    path: "poems/christina-rossetti/echo.txt",
    start: "Come to me in the silence of the night;",
    end: "As long ago, my love, how long ago!",
  },
  {
    ebookId: "16950",
    path: "poems/christina-rossetti/goblin-market.txt",
    start: "Morning and evening",
    end: "To strengthen whilst one stands.'",
  },
  {
    ebookId: "16950",
    path: "poems/christina-rossetti/up-hill.txt",
    start: "Does the road wind up-hill all the way?",
    end: "Yea, beds for all who come.",
  },
  {
    ebookId: "10031",
    path: "poems/edgar-allan-poe/alone.txt",
    start: "From childhood's hour I have not been",
    end: "Of a demon in my view.",
  },
  {
    ebookId: "10031",
    path: "poems/edgar-allan-poe/lenore.txt",
    start: "Ah, broken is the golden bowl! the spirit flown forever!",
    end: 'From grief and groan to a golden throne beside the King of Heaven."',
  },
  {
    ebookId: "4800",
    path: "poems/percy-bysshe-shelley/loves-philosophy.txt",
    start: "The fountains mingle with the river",
    end: "If thou kiss not me?",
  },
  {
    ebookId: "4800",
    path: "poems/percy-bysshe-shelley/to-a-skylark.txt",
    start: "Hail to thee, blithe Spirit!",
    end: "The world should listen then—as I am listening now.",
  },
  {
    ebookId: "4800",
    path: "poems/percy-bysshe-shelley/to-night.txt",
    start: "Swiftly walk o’er the western wave,",
    end: "Come soon, soon!",
  },
];

const ebookCache = new Map();

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

async function getEbookLines(ebookId) {
  if (!ebookCache.has(ebookId)) {
    const response = await fetch(`https://www.gutenberg.org/ebooks/${ebookId}.txt.utf-8`, {
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ebook ${ebookId} (${response.status})`);
    }
    const text = stripBoilerplate(normalizeText(await response.text()));
    ebookCache.set(ebookId, text.split("\n"));
  }
  return ebookCache.get(ebookId);
}

function findLineIndex(lines, needle, occurrence = 0) {
  let seen = 0;
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].trim().includes(needle.trim())) {
      continue;
    }
    if (seen === occurrence) {
      return index;
    }
    seen += 1;
  }
  throw new Error(`Could not find line "${needle}" (occurrence ${occurrence})`);
}

function extractPoem(lines, spec) {
  const startIndex = findLineIndex(lines, spec.start, spec.occurrence ?? 0);
  const endIndex = findLineIndex(lines, spec.end, 0);
  if (endIndex < startIndex) {
    throw new Error(`End marker appears before start for ${spec.path}`);
  }
  return `${lines.slice(startIndex, endIndex + 1).join("\n").trim()}\n`;
}

async function main() {
  for (const spec of SPECS) {
    const lines = await getEbookLines(spec.ebookId);
    const poem = extractPoem(lines, spec);
    await fs.writeFile(spec.path, poem, "utf8");
    console.log(`repaired ${spec.path}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
