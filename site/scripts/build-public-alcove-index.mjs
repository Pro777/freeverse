import fs from "node:fs/promises";
import path from "node:path";
import poemIndex from "../src/data/poem-index.json" with { type: "json" };

const siteRoot = process.cwd();
const repoRoot = path.resolve(siteRoot, "..");
const publicApiDir = path.join(siteRoot, "public", "api");
const corpusOutputPath = path.join(publicApiDir, "freeverse-public-corpus.jsonl");
const manifestOutputPath = path.join(publicApiDir, "freeverse-public-manifest.json");
const siteUrl = process.env.SITE_URL || "https://thefreeverse.org";
const collectionName = "freeverse_public";

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function poemUrl(baseUrl, poemId) {
  return `${normalizeBaseUrl(baseUrl)}poem/${encodeURIComponent(poemId).replace(/%2F/g, "/")}/`;
}

function authorUrl(baseUrl, authorSlug) {
  return `${normalizeBaseUrl(baseUrl)}author/${encodeURIComponent(authorSlug)}/`;
}

function normalizeText(value) {
  return value.replace(/\r\n?/g, "\n").trim();
}

function excerptFromText(text) {
  const stanza = text.split(/\n\s*\n/)[0]?.trim() || "";
  return stanza.split("\n").slice(0, 8).join("\n").trim();
}

function titleCaseRatio(line) {
  const words = line.match(/[A-Za-zÀ-ÿ'’]+/g) || [];
  if (words.length === 0) return 0;
  const capitalized = words.filter((word) => /^[A-ZÀ-Þ]/.test(word)).length;
  return capitalized / words.length;
}

function looksLikeTableOfContents(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (lines.length < 8) return false;

  const avgTitleRatio =
    lines.reduce((sum, line) => sum + titleCaseRatio(line), 0) / lines.length;
  const avgWordCount =
    lines.reduce((sum, line) => sum + (line.match(/[A-Za-zÀ-ÿ'’]+/g) || []).length, 0) / lines.length;

  return avgTitleRatio >= 0.68 && avgWordCount <= 4.5;
}

function sanitizeMetadata(poem, baseUrl) {
  return {
    collection: collectionName,
    type: "poem",
    id: poem.id,
    title: poem.title,
    author: poem.author,
    author_slug: poem.author_slug,
    poem_url: poemUrl(baseUrl, poem.id),
    author_url: authorUrl(baseUrl, poem.author_slug),
    century: String(poem.century),
    text_locale: poem.text_locale,
    original_language: poem.original_language,
    text_direction: poem.text_direction,
    source_label: poem.source_label,
    source_url: poem.source_url,
    canonical_source_type: poem.canonical_source?.type ?? "",
    canonical_source_id: poem.canonical_source?.id ?? "",
    translator: poem.translator ?? "",
    translation_of: poem.translation_of ?? "",
    rights_jurisdiction: poem.rights?.jurisdiction ?? "US",
    public_domain_rationale: poem.public_domain_rationale,
  };
}

async function loadCorpusRecords(baseUrl) {
  const payload = poemIndex;
  const poems = Array.isArray(payload.poems) ? payload.poems : [];
  const records = [];
  const excluded = [];

  for (const poem of poems) {
    if (!poem.text_in_repo || !poem.text_path) continue;

    const textPath = path.join(repoRoot, poem.text_path);
    const raw = await fs.readFile(textPath, "utf8");
    const text = normalizeText(raw);
    if (!text) continue;
    if (looksLikeTableOfContents(text)) {
      excluded.push({ id: poem.id, reason: "opening block looks like table of contents or edition matter" });
      continue;
    }

    records.push({
      source_id: poem.id,
      url: poemUrl(baseUrl, poem.id),
      title: `${poem.title} — ${poem.author}`,
      text,
      metadata: {
        ...sanitizeMetadata(poem, baseUrl),
        excerpt: excerptFromText(text),
      },
    });
  }

  records.sort((a, b) => a.source_id.localeCompare(b.source_id));
  excluded.sort((a, b) => a.id.localeCompare(b.id));
  return { records, excluded };
}

async function main() {
  const baseUrl = normalizeBaseUrl(siteUrl);
  const { records, excluded } = await loadCorpusRecords(baseUrl);
  const generatedAt = new Date().toISOString();

  await fs.mkdir(publicApiDir, { recursive: true });
  await fs.writeFile(
    corpusOutputPath,
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
    "utf8",
  );

  const manifest = {
    generated_at: generatedAt,
    collection: collectionName,
    site_url: baseUrl,
    record_count: records.length,
    excluded_count: excluded.length,
    format: "jsonl",
    schema_version: 1,
    includes: [
      "public poem text",
      "public metadata",
      "canonical Freeverse URLs",
      "upstream public-domain source URLs",
      "US public-domain rationale",
    ],
    excludes: [
      "filesystem paths",
      "hashes and dedupe internals",
      "operator-local configuration",
      "private notes",
      "build implementation details",
      "PII beyond already-public author names",
    ],
    record_shape: {
      source_id: "canonical poem id",
      url: "Freeverse poem URL",
      title: "display title",
      text: "full poem text",
      metadata: "sanitized public metadata for Alcove ingestion",
    },
    exclusions: excluded,
  };

  await fs.writeFile(`${manifestOutputPath}`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Wrote public Alcove corpus (${records.length} records)`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
