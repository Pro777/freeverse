type SemanticCorpusRecord = {
  source_id?: string;
  url?: string;
  title?: string;
  text?: string;
  metadata?: {
    author?: string;
    excerpt?: string;
    text_locale?: string;
    original_language?: string;
    text_direction?: "ltr" | "rtl";
    translator?: string;
  };
};

type SearchDoc = {
  id: string;
  title: string;
  author: string;
  url: string;
  excerpt: string;
  textLocale: string;
  originalLanguage: string;
  textDirection: "ltr" | "rtl";
  translator: string;
  semanticText: string;
};

type LabElements = {
  form: HTMLFormElement;
  query: HTMLInputElement;
  limit: HTMLSelectElement;
  status: HTMLElement;
  metrics: HTMLElement;
  results: HTMLElement;
  boot: HTMLButtonElement;
};

type SetupOptions = {
  corpusUrl: string;
  modelId: string;
  maxDocs?: number;
};

type Extractor = (input: string | string[], options?: Record<string, unknown>) => Promise<unknown>;

type IndexedDoc = SearchDoc & {
  embedding: Float32Array;
};

const MAX_EXCERPT_CHARS = 360;
const MAX_TEXT_CHARS = 1200;
const DEFAULT_MAX_DOCS = 160;
const DEFAULT_LIMIT = 8;

function parseJsonl(jsonl: string): SemanticCorpusRecord[] {
  return jsonl
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SemanticCorpusRecord);
}

function truncateText(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 1).trimEnd()}…`;
}

function recordToDoc(record: SemanticCorpusRecord): SearchDoc | null {
  const id = record.source_id?.trim();
  const title = record.title?.trim();
  const author = record.metadata?.author?.trim();
  const url = record.url?.trim();
  if (!id || !title || !author || !url) return null;

  const excerptSource = record.metadata?.excerpt?.trim() || record.text?.trim() || "";
  const excerpt = truncateText(excerptSource, MAX_EXCERPT_CHARS);
  const semanticBody = truncateText(record.text?.trim() || excerptSource, MAX_TEXT_CHARS);
  const textLocale = record.metadata?.text_locale?.trim() || "en";
  const originalLanguage = record.metadata?.original_language?.trim() || textLocale;
  const translator = record.metadata?.translator?.trim() || "";
  const semanticText = [
    title,
    author,
    `language ${textLocale}`,
    excerpt,
    semanticBody,
  ]
    .filter(Boolean)
    .join(". ");

  return {
    id,
    title,
    author,
    url,
    excerpt,
    textLocale,
    originalLanguage,
    textDirection: record.metadata?.text_direction === "rtl" ? "rtl" : "ltr",
    translator,
    semanticText,
  };
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    dot += left * right;
    magA += left * left;
    magB += right * right;
  }

  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function tensorToVectors(output: unknown): Float32Array[] {
  const maybeTensor = output as {
    data?: Float32Array | number[];
    dims?: number[];
  };

  if (!maybeTensor?.data || !Array.isArray(maybeTensor.dims) || maybeTensor.dims.length < 2) {
    throw new Error("Unexpected embedding output shape.");
  }

  const data = maybeTensor.data instanceof Float32Array
    ? maybeTensor.data
    : Float32Array.from(maybeTensor.data);
  const [rows, cols] = maybeTensor.dims;
  if (!rows || !cols) throw new Error("Embedding output was empty.");

  const vectors: Float32Array[] = [];
  for (let row = 0; row < rows; row += 1) {
    vectors.push(data.slice(row * cols, (row + 1) * cols));
  }
  return vectors;
}

async function loadExtractor(modelId: string): Promise<Extractor> {
  const { env, pipeline } = await import("@huggingface/transformers");
  env.allowLocalModels = false;
  env.useBrowserCache = true;

  const device = "gpu" in navigator ? "webgpu" : "wasm";
  return pipeline("feature-extraction", modelId, {
    device,
    dtype: device === "webgpu" ? "fp16" : "q8",
  }) as Promise<Extractor>;
}

function updateStatus(elements: LabElements, message: string) {
  elements.status.textContent = message;
}

function updateMetrics(elements: LabElements, message: string) {
  elements.metrics.textContent = message;
}

function renderResults(elements: LabElements, results: Array<IndexedDoc & { score: number }>) {
  elements.results.innerHTML = "";

  if (!results.length) {
    const empty = document.createElement("p");
    empty.className = "text-sm text-[var(--muted)]";
    empty.textContent = "No semantic matches yet.";
    elements.results.appendChild(empty);
    return;
  }

  for (const result of results) {
    const article = document.createElement("article");
    article.className = "rounded-3xl border border-black/10 bg-[color-mix(in_oklab,var(--paper)_92%,transparent)] p-5 shadow-[var(--shadow)]";

    const languageMeta = [
      result.textLocale && result.textLocale !== "en" ? `Text: ${result.textLocale}` : "",
      result.originalLanguage && result.originalLanguage !== result.textLocale
        ? `Original: ${result.originalLanguage}`
        : "",
      result.translator ? `Translator: ${result.translator}` : "",
      `Score: ${result.score.toFixed(3)}`,
    ].filter(Boolean);

    article.innerHTML = `
      <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <a class="text-lg font-semibold text-[var(--ink)]" href="${result.url}">${result.title}</a>
        <span class="text-sm text-[var(--muted)]">by ${result.author}</span>
      </div>
      <p class="mt-2 text-sm text-[var(--muted)]">${languageMeta.join(" · ")}</p>
      <p class="mt-3 text-[var(--muted)]" lang="${result.textLocale}" dir="${result.textDirection}">${result.excerpt}</p>
    `;

    elements.results.appendChild(article);
  }
}

function getElements(): LabElements {
  const form = document.querySelector<HTMLFormElement>("[data-semantic-form]");
  const query = document.querySelector<HTMLInputElement>("[data-semantic-query]");
  const limit = document.querySelector<HTMLSelectElement>("[data-semantic-limit]");
  const status = document.querySelector<HTMLElement>("[data-semantic-status]");
  const metrics = document.querySelector<HTMLElement>("[data-semantic-metrics]");
  const results = document.querySelector<HTMLElement>("[data-semantic-results]");
  const boot = document.querySelector<HTMLButtonElement>("[data-semantic-boot]");

  if (!form || !query || !limit || !status || !metrics || !results || !boot) {
    throw new Error("Semantic search lab elements were not found.");
  }

  return { form, query, limit, status, metrics, results, boot };
}

export async function setupSemanticSearchLab({
  corpusUrl,
  modelId,
  maxDocs = DEFAULT_MAX_DOCS,
}: SetupOptions) {
  const elements = getElements();
  let extractorPromise: Promise<Extractor> | null = null;
  let indexPromise: Promise<IndexedDoc[]> | null = null;

  const bootIndex = async () => {
    if (indexPromise) return indexPromise;

    indexPromise = (async () => {
      updateStatus(elements, "Downloading the public corpus export...");
      const startedAt = performance.now();
      const response = await fetch(corpusUrl);
      if (!response.ok) {
        throw new Error(`Corpus download failed with ${response.status}.`);
      }

      const jsonl = await response.text();
      const docs = parseJsonl(jsonl)
        .map(recordToDoc)
        .filter((value): value is SearchDoc => Boolean(value))
        .slice(0, maxDocs);

      updateStatus(elements, `Loaded ${docs.length} poems. Loading multilingual embedding model...`);
      extractorPromise ??= loadExtractor(modelId);
      const extractor = await extractorPromise;

      const indexed: IndexedDoc[] = [];
      const batchSize = 12;
      for (let index = 0; index < docs.length; index += batchSize) {
        const batch = docs.slice(index, index + batchSize);
        updateStatus(elements, `Embedding poems ${index + 1}-${Math.min(index + batch.length, docs.length)} of ${docs.length}...`);
        const output = await extractor(
          batch.map((doc) => doc.semanticText),
          { pooling: "mean", normalize: true },
        );
        const vectors = tensorToVectors(output);
        for (let offset = 0; offset < batch.length; offset += 1) {
          indexed.push({ ...batch[offset], embedding: vectors[offset] });
        }
      }

      const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
      updateStatus(elements, `Semantic index ready in ${elapsed}s.`);
      updateMetrics(elements, `${indexed.length} poems indexed client-side with ${modelId}.`);
      return indexed;
    })();

    try {
      return await indexPromise;
    } catch (error) {
      indexPromise = null;
      throw error;
    }
  };

  const runSearch = async () => {
    const query = elements.query.value.trim();
    if (!query) {
      renderResults(elements, []);
      updateStatus(elements, "Enter a query to compare meaning across languages.");
      return;
    }

    const index = await bootIndex();
    extractorPromise ??= loadExtractor(modelId);
    const extractor = await extractorPromise;

    updateStatus(elements, `Embedding query: “${query}”`);
    const output = await extractor(query, { pooling: "mean", normalize: true });
    const [queryEmbedding] = tensorToVectors(output);
    const limit = Number.parseInt(elements.limit.value, 10) || DEFAULT_LIMIT;

    const matches = index
      .map((doc) => ({ ...doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }))
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    renderResults(elements, matches);
    updateStatus(elements, `Showing the top ${matches.length} semantic matches for “${query}”.`);
  };

  elements.boot.addEventListener("click", async () => {
    elements.boot.disabled = true;
    try {
      await bootIndex();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Semantic index boot failed.";
      updateStatus(elements, message);
      updateMetrics(elements, "This proof route failed to initialize in the current browser.");
    } finally {
      elements.boot.disabled = false;
    }
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await runSearch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Semantic search failed.";
      updateStatus(elements, message);
    }
  });

  for (const button of document.querySelectorAll<HTMLElement>("[data-semantic-sample]")) {
    button.addEventListener("click", () => {
      elements.query.value = button.dataset.semanticSample ?? "";
      elements.query.focus();
    });
  }
}
