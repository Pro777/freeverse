import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "author",
  "author_slug",
  "title",
  "century",
  "text_in_repo",
  "source_label",
  "source_url",
  "public_domain_rationale",
];

const LOCALE_RE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const TEXT_DIRECTIONS = new Set(["ltr", "rtl"]);

const repoRoot = path.resolve(process.cwd(), "..");
const metaRoot = path.join(repoRoot, "meta");
const outputPath = path.join(process.cwd(), "src", "data", "poem-index.json");
const dedupeReportPath = path.join(process.cwd(), "src", "data", "dedupe-report.json");

const STATIC_PAGE_LIMIT = 5000;

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/\r\n?/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveCanonicalSource(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    const host = url.hostname.toLowerCase();
    if (host.endsWith("gutenberg.org")) {
      const ebook = url.pathname.match(/\/(ebooks|epub)\/(\d+)/);
      return {
        type: "gutenberg",
        id: ebook ? `gutenberg:${ebook[2]}` : `gutenberg:${url.pathname}`,
        url: sourceUrl,
      };
    }
    if (host.includes("wikisource.org")) {
      return {
        type: "wikisource",
        id: `wikisource:${url.pathname.replace(/^\/+/, "")}`,
        url: sourceUrl,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function rightsLooksValid(rationale) {
  const s = rationale.toLowerCase();
  const hasPd = s.includes("public domain");
  const hasBasis =
    /\b\d{4}\b/.test(s) ||
    /\b\d+\s*bc\b/.test(s) ||
    s.includes("pre-1929") ||
    s.includes("pre 1929");
  return hasPd && hasBasis;
}

function localeLooksValid(value) {
  return typeof value === "string" && LOCALE_RE.test(value);
}

function normalizeLocaleMetadata(meta) {
  const text_locale = typeof meta.text_locale === "string" ? meta.text_locale : "en";
  const original_language =
    typeof meta.original_language === "string" ? meta.original_language : text_locale;
  const text_direction = typeof meta.text_direction === "string" ? meta.text_direction : "ltr";

  return {
    ...meta,
    text_locale,
    original_language,
    text_direction,
  };
}

async function main() {
  const errors = [];
  const metas = [];

  const authorDirs = await fs.readdir(metaRoot, { withFileTypes: true });
  for (const author of authorDirs) {
    if (!author.isDirectory()) continue;
    const dir = path.join(metaRoot, author.name);
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith(".yml")) continue;
      const full = path.join(dir, f.name);
      const raw = await fs.readFile(full, "utf8");
      const parsed = yaml.load(raw);
      if (!parsed || typeof parsed !== "object") {
        errors.push(`${full}: metadata is not a YAML object`);
        continue;
      }

      const meta = normalizeLocaleMetadata(parsed);
      for (const field of REQUIRED_FIELDS) {
        if (!(field in meta)) errors.push(`${full}: missing required field '${field}'`);
      }
      if (meta.text_in_repo === true && !meta.text_path) {
        errors.push(`${full}: text_in_repo=true requires text_path`);
      }
      if (typeof meta.id === "string" && typeof meta.slug === "string") {
        const expectedId = `${meta.author_slug}/${meta.slug}`;
        if (meta.id !== expectedId) errors.push(`${full}: id must equal '${expectedId}'`);
      }
      const canonical_source = deriveCanonicalSource(meta.source_url);
      if (!canonical_source) {
        errors.push(`${full}: source_url must be canonical (Project Gutenberg or Wikisource)`);
      }
      if (typeof meta.public_domain_rationale === "string" && !rightsLooksValid(meta.public_domain_rationale)) {
        errors.push(`${full}: public_domain_rationale must mention 'Public domain' and a year/basis`);
      }
      if (!localeLooksValid(meta.text_locale)) {
        errors.push(`${full}: text_locale must be a valid BCP 47-style tag`);
      }
      if (!localeLooksValid(meta.original_language)) {
        errors.push(`${full}: original_language must be a valid BCP 47-style tag`);
      }
      if (!TEXT_DIRECTIONS.has(meta.text_direction)) {
        errors.push(`${full}: text_direction must be 'ltr' or 'rtl'`);
      }
      if (meta.translation_of && typeof meta.translation_of !== "string") {
        errors.push(`${full}: translation_of must be a canonical poem id string when present`);
      }
      if (meta.translator && typeof meta.translator !== "string") {
        errors.push(`${full}: translator must be a string when present`);
      }

      let text = "";
      let text_sha256 = "";
      let normalized_sha256 = "";
      if (meta.text_in_repo && meta.text_path) {
        const poemPath = path.join(repoRoot, meta.text_path);
        try {
          text = await fs.readFile(poemPath, "utf8");
          text_sha256 = sha256(text);
          normalized_sha256 = sha256(normalizeText(text));
        } catch {
          errors.push(`${full}: text_path missing on disk (${meta.text_path})`);
        }
      }

      metas.push({
        ...meta,
        canonical_source,
        rights: {
          jurisdiction: "US",
          basis: meta.public_domain_rationale,
        },
        text_sha256,
        normalized_sha256,
        text_length: text.length,
      });
    }
  }

  metas.sort((a, b) => a.id.localeCompare(b.id));

  const byNormHash = new Map();
  for (const m of metas) {
    if (!m.normalized_sha256) continue;
    const arr = byNormHash.get(m.normalized_sha256) || [];
    arr.push(m);
    byNormHash.set(m.normalized_sha256, arr);
  }

  const duplicate_clusters = [];
  for (const [hash, cluster] of byNormHash.entries()) {
    if (cluster.length < 2) continue;
    cluster.sort((a, b) => a.id.localeCompare(b.id));
    duplicate_clusters.push({
      normalized_sha256: hash,
      canonical_id: cluster[0].id,
      members: cluster.map((m) => ({
        id: m.id,
        source_url: m.source_url,
        canonical_source: m.canonical_source,
      })),
    });
  }

  const near_variant_candidates = [];
  const byAuthorTitle = new Map();
  for (const m of metas) {
    const k = `${m.author_slug}::${m.title.toLowerCase().replace(/\s+/g, " ").trim()}`;
    const arr = byAuthorTitle.get(k) || [];
    arr.push(m);
    byAuthorTitle.set(k, arr);
  }
  for (const [k, arr] of byAuthorTitle.entries()) {
    if (arr.length > 1) {
      near_variant_candidates.push({
        key: k,
        members: arr.map((m) => ({ id: m.id, text_sha256: m.text_sha256, source_url: m.source_url })),
      });
    }
  }

  if (errors.length > 0) {
    console.error("Metadata/provenance validation failed:");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify({ generated_at: new Date().toISOString(), poems: metas }, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    dedupeReportPath,
    `${JSON.stringify({ duplicate_clusters, near_variant_candidates }, null, 2)}\n`,
    "utf8",
  );

  const staticPageCount = metas.length;
  if (staticPageCount > STATIC_PAGE_LIMIT) {
    process.stderr.write(
      `WARNING: static page count (${staticPageCount}) exceeds the ${STATIC_PAGE_LIMIT}-page limit. ` +
      `This may cause slow builds or bloated deploy artifacts.\n`,
    );
  }

  console.log(
    `Wrote poem index (${metas.length} poems), duplicate clusters: ${duplicate_clusters.length}, near-variant candidates: ${near_variant_candidates.length}`,
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
