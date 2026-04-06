import fs from "node:fs/promises";
import path from "node:path";
import {
  detectThemes,
  normalizeSearchText,
  tokenizeSearchText,
} from "../src/lib/search-taxonomy.mjs";
import { collectionRecords } from "../src/lib/collection-records.mjs";
import poemIndex from "../src/data/poem-index.json" with { type: "json" };

const repoRoot = path.resolve(process.cwd(), "..");
const outputPath = path.join(process.cwd(), "public", "api", "search-index.json");

const KEYWORD_STOP_WORDS = new Set([
  "among",
  "been",
  "from",
  "have",
  "into",
  "more",
  "must",
  "shall",
  "than",
  "their",
  "them",
  "they",
  "this",
  "those",
  "upon",
  "were",
  "when",
  "which",
  "while",
  "with",
  "would",
  "your",
]);

function buildExcerpt(text) {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  const excerpt = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (excerpt.length > 0) break;
      continue;
    }

    excerpt.push(line.trim());
    if (excerpt.length >= 4) break;
  }

  return excerpt.join(" ");
}

function buildKeywords(text) {
  const counts = new Map();
  for (const token of tokenizeSearchText(text)) {
    if (token.length < 4) continue;
    if (KEYWORD_STOP_WORDS.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([token]) => token);
}

async function main() {
  const poems = poemIndex.poems || [];
  const collectionsByPoemId = new Map();

  for (const collection of collectionRecords) {
    for (const poemId of collection.poemIds) {
      const existing = collectionsByPoemId.get(poemId) || [];
      existing.push(collection);
      collectionsByPoemId.set(poemId, existing);
    }
  }

  const docs = [];

  for (const poem of poems) {
    let text = "";
    if (poem.text_in_repo && poem.text_path) {
      text = await fs.readFile(path.join(repoRoot, poem.text_path), "utf8");
    }

    const excerpt = buildExcerpt(text);
    const collections = collectionsByPoemId.get(poem.id) || [];
    const matchedThemes = Array.from(
      new Map(
        [
          ...collections.flatMap((collection) => detectThemes(`${collection.title} ${collection.description}`, { minSignals: 1 })),
          ...detectThemes(poem.title, { minSignals: 1 }),
          ...detectThemes(`${excerpt}\n${text}`, { minSignals: 2 }),
        ].map((theme) => [theme.id, theme]),
      ).values(),
    );
    const themes = matchedThemes.map((theme) => theme.label);
    const semanticTerms = Array.from(
      new Set(
        matchedThemes.flatMap((theme) => [
          theme.id,
          theme.label.toLowerCase(),
          ...theme.queryTerms,
        ]),
      ),
    );
    const keywords = buildKeywords(`${poem.title} ${excerpt} ${text}`);

    docs.push({
      id: poem.id,
      title: poem.title,
      author: poem.author,
      century: poem.century,
      text_locale: poem.text_locale,
      original_language: poem.original_language,
      text_direction: poem.text_direction,
      translator: poem.translator ?? "",
      excerpt,
      collections: collections.map((collection) => collection.title),
      themes,
      semanticTerms,
      keywords,
      searchText: normalizeSearchText(
        [
          poem.title,
          poem.author,
          poem.text_locale,
          poem.original_language,
          excerpt,
          collections.map((collection) => `${collection.title} ${collection.description}`).join(" "),
          themes.join(" "),
          semanticTerms.join(" "),
          keywords.join(" "),
        ].join(" "),
      ),
    });
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify({ generated_at: new Date().toISOString(), poems: docs }, null, 2)}\n`,
    "utf8",
  );

  console.log(`Wrote semantic search index (${docs.length} poems)`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
