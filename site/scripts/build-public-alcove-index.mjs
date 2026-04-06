import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import poemIndex from "../src/data/poem-index.json" with { type: "json" };

const siteRoot = process.cwd();
const repoRoot = path.resolve(siteRoot, "..");
const publicApiDir = path.join(siteRoot, "public", "api");
const corpusOutputPath = path.join(publicApiDir, "freeverse-public-corpus.jsonl");
const chunksOutputPath = path.join(publicApiDir, "freeverse-public-chunks.jsonl");
const manifestOutputPath = path.join(publicApiDir, "freeverse-public-manifest.json");
const siteUrl = process.env.SITE_URL || "https://thefreeverse.org";
const collectionName = "freeverse_public";
const chunkConfig = {
  size: 1000,
  overlap: 150,
};

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function poemUrl(baseUrl, poemId) {
  return `${normalizeBaseUrl(baseUrl)}poem/${encodeURIComponent(poemId).replace(/%2F/g, "/")}/`;
}

function authorUrl(baseUrl, authorSlug) {
  return `${normalizeBaseUrl(baseUrl)}author/${encodeURIComponent(authorSlug)}/`;
}

function artifactUrl(baseUrl, filePath) {
  return `${normalizeBaseUrl(baseUrl)}api/${path.basename(filePath)}`;
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

function chunkText(text, size, overlap) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + size);
    chunks.push({
      text: normalized.slice(start, end),
      start,
      end,
    });
    if (end === normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function writeJsonl(filePath, records) {
  const body = records.map((record) => JSON.stringify(record)).join("\n");
  const content = `${body}${body ? "\n" : ""}`;
  await fs.writeFile(filePath, content, "utf8");
  return {
    bytes: Buffer.byteLength(content, "utf8"),
    sha256: sha256(content),
  };
}

async function loadCorpusRecords(baseUrl) {
  const payload = poemIndex;
  const poems = Array.isArray(payload.poems) ? payload.poems : [];
  const records = [];
  const chunks = [];
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

    const metadata = {
      ...sanitizeMetadata(poem, baseUrl),
      excerpt: excerptFromText(text),
    };

    records.push({
      source_id: poem.id,
      url: poemUrl(baseUrl, poem.id),
      title: `${poem.title} — ${poem.author}`,
      text,
      metadata,
    });

    for (const [index, chunk] of chunkText(text, chunkConfig.size, chunkConfig.overlap).entries()) {
      chunks.push({
        id: `${poem.id}:${index}`,
        source: poem.id,
        chunk: chunk.text,
        metadata: {
          ...metadata,
          chunk_index: index,
          chunk_start: chunk.start,
          chunk_end: chunk.end,
          source_document_url: poemUrl(baseUrl, poem.id),
        },
      });
    }
  }

  records.sort((a, b) => a.source_id.localeCompare(b.source_id));
  chunks.sort((a, b) => a.id.localeCompare(b.id));
  excluded.sort((a, b) => a.id.localeCompare(b.id));
  return { records, chunks, excluded };
}

async function main() {
  const baseUrl = normalizeBaseUrl(siteUrl);
  const { records, chunks, excluded } = await loadCorpusRecords(baseUrl);
  const generatedAt = new Date().toISOString();

  await fs.mkdir(publicApiDir, { recursive: true });
  const corpusArtifact = await writeJsonl(corpusOutputPath, records);
  const chunksArtifact = await writeJsonl(chunksOutputPath, chunks);

  const manifest = {
    generated_at: generatedAt,
    collection: collectionName,
    site_url: baseUrl,
    record_count: records.length,
    chunk_count: chunks.length,
    excluded_count: excluded.length,
    schema_version: 1,
    chunking: {
      strategy: "character-window over whitespace-normalized text",
      size: chunkConfig.size,
      overlap: chunkConfig.overlap,
    },
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
      metadata: "sanitized public metadata for source-document ingestion",
    },
    chunk_record_shape: {
      id: "stable chunk id",
      source: "canonical poem id",
      chunk: "whitespace-normalized text window",
      metadata: "sanitized public metadata plus chunk coordinates",
    },
    artifacts: [
      {
        name: "source_documents",
        path: "/api/freeverse-public-corpus.jsonl",
        url: artifactUrl(baseUrl, corpusOutputPath),
        format: "jsonl",
        record_count: records.length,
        bytes: corpusArtifact.bytes,
        sha256: corpusArtifact.sha256,
      },
      {
        name: "alcove_chunks",
        path: "/api/freeverse-public-chunks.jsonl",
        url: artifactUrl(baseUrl, chunksOutputPath),
        format: "jsonl",
        record_count: chunks.length,
        bytes: chunksArtifact.bytes,
        sha256: chunksArtifact.sha256,
      },
    ],
    exclusions: excluded,
  };

  await fs.writeFile(manifestOutputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Wrote public Alcove corpus (${records.length} records, ${chunks.length} chunks)`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
