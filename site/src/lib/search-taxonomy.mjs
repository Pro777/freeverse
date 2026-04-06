const DEFAULT_STOP_WORDS = [
  "a",
  "about",
  "an",
  "and",
  "for",
  "in",
  "into",
  "of",
  "on",
  "or",
  "poem",
  "poems",
  "the",
  "to",
  "with",
];

export const SEARCH_STOP_WORDS = new Set(DEFAULT_STOP_WORDS);

export const SEMANTIC_THEMES = [
  {
    id: "grief",
    label: "Grief and mortality",
    queryTerms: ["grief", "mourning", "loss", "death", "funeral", "afterlife", "mortality", "sorrow"],
    signalTerms: ["grief", "mourning", "loss", "death", "dead", "dying", "funeral", "tomb", "grave", "coffin", "afterlife", "sorrow"],
  },
  {
    id: "love",
    label: "Love and desire",
    queryTerms: ["love", "desire", "beloved", "heart", "romance", "passion"],
    signalTerms: ["love", "beloved", "heart", "kiss", "desire", "lover", "romance", "passion"],
  },
  {
    id: "nature",
    label: "Nature and seasons",
    queryTerms: ["nature", "season", "spring", "summer", "autumn", "winter", "flower", "garden"],
    signalTerms: ["nature", "spring", "summer", "autumn", "winter", "flower", "flowers", "rose", "garden", "field", "tree", "leaf", "leaves"],
  },
  {
    id: "night",
    label: "Night and dream",
    queryTerms: ["night", "dream", "moon", "sleep", "dark", "midnight", "star"],
    signalTerms: ["night", "dream", "dreams", "moon", "sleep", "dark", "midnight", "star", "stars", "shadow"],
  },
  {
    id: "sea",
    label: "Sea and voyage",
    queryTerms: ["sea", "ocean", "shore", "voyage", "ship", "sail", "harbor"],
    signalTerms: ["sea", "ocean", "shore", "wave", "waves", "ship", "ships", "sail", "harbor", "harbour", "voyage", "tide"],
  },
  {
    id: "faith",
    label: "Faith and devotion",
    queryTerms: ["faith", "devotion", "prayer", "god", "soul", "heaven", "hymn"],
    signalTerms: ["faith", "prayer", "god", "soul", "heaven", "divine", "hymn", "saint", "altar", "angel"],
  },
  {
    id: "war",
    label: "War and history",
    queryTerms: ["war", "battle", "history", "empire", "nation", "soldier", "king"],
    signalTerms: ["war", "battle", "empire", "nation", "soldier", "soldiers", "king", "queen", "history", "ruin", "ruins", "victory"],
  },
  {
    id: "solitude",
    label: "Solitude and inwardness",
    queryTerms: ["solitude", "lonely", "silence", "memory", "mind", "inward", "alone"],
    signalTerms: ["solitude", "lonely", "silence", "memory", "mind", "alone", "inward", "silent", "thought", "thoughts"],
  },
  {
    id: "birdsong",
    label: "Birdsong and music",
    queryTerms: ["bird", "birdsong", "music", "song", "voice", "skylark", "nightingale"],
    signalTerms: ["bird", "birds", "music", "song", "songs", "voice", "voices", "sing", "singing", "skylark", "nightingale"],
  },
];

const THEME_LOOKUP = new Map(
  SEMANTIC_THEMES.flatMap((theme) =>
    [...theme.queryTerms, ...theme.signalTerms].map((term) => [term.toLowerCase(), theme]),
  ),
);

export function normalizeSearchText(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\r\n?/g, "\n")
    .replace(/\p{M}+/gu, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, "-")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchText(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !SEARCH_STOP_WORDS.has(token));
}

function countSignalHits(normalized, signalTerms) {
  let hits = 0;

  for (const term of signalTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(?=$|\\s)`, "i");
    if (pattern.test(normalized)) hits += 1;
  }

  return hits;
}

export function detectThemes(value, options = {}) {
  const { minSignals = 1 } = options;
  const normalized = normalizeSearchText(value);

  return SEMANTIC_THEMES.filter(
    (theme) => countSignalHits(normalized, theme.signalTerms) >= minSignals,
  );
}

export function expandSearchTerms(value) {
  const tokens = tokenizeSearchText(value);
  const expanded = new Set(tokens);

  for (const token of tokens) {
    const theme = THEME_LOOKUP.get(token);
    if (!theme) continue;

    expanded.add(theme.id);
    expanded.add(theme.label.toLowerCase());
    for (const term of theme.queryTerms) expanded.add(term);
  }

  return Array.from(expanded);
}
