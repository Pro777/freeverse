import fs from 'node:fs/promises';

const REPAIRS = [
  {
    file: 'poems/alfred-tennyson/break-break-break.txt',
    start: /^Break, break, break,$/,
    end: /^The Poet’s Song$/,
  },
  {
    file: 'poems/edgar-allan-poe/alone.txt',
    start: /^  From childhood's hour I have not been$/,
    end: /^March 17, 1829\.$/,
    includeEnd: true,
  },
  {
    file: 'poems/christina-rossetti/when-i-am-dead-my-dearest.txt',
    start: /^  Sing no sad songs for me;$/,
    end: /^DEAD BEFORE DEATH$/,
  },
  {
    file: 'poems/christina-rossetti/song.txt',
    start: /^Oh roses for the flush of youth,$/,
    end: /^THE HOUR AND THE GHOST$/,
  },
  {
    file: 'poems/george-gordon-byron/stanzas-for-music.txt',
    start: /^    There be none of Beauty's daughters$/,
    end: /^\s*ON THE STAR OF "THE LEGION OF HONOUR\./,
  },
  {
    file: 'poems/george-gordon-byron/when-we-two-parted.txt',
    start: /^    When we two parted$/,
    end: /^\s*\[LOVE AND GOLD\./,
  },
  {
    file: 'poems/george-gordon-byron/the-destruction-of-sennacherib.txt',
    start: /^    The Assyrian came down like the wolf on the fold,$/,
    end: /^\s*A SPIRIT PASSED BEFORE ME\.$/,
  },
  {
    file: 'poems/john-keats/on-first-looking-into-chapmans-homer.txt',
    start: /^     Much have I travelled in the realms of gold,$/,
    end: /^Of the work upon which he was now engaged, the narrative-poem of$/,
  },
  {
    file: 'poems/john-keats/la-belle-dame-sans-merci.txt',
    start: /^     Oh what can ail thee Knight at arms$/,
    end: /^NOTES ON ISABELLA\.$/,
  },
  {
    file: 'poems/john-keats/ode-on-a-grecian-urn.txt',
    start: /^  1\.$/,
    end: /^ODE TO PSYCHE\.$/,
  },
  {
    file: 'poems/william-blake/a-poison-tree.txt',
    start: /^I was angry with my friend:$/,
    end: /^A LITTLE BOY LOST$/,
  },
  {
    file: 'poems/william-wordsworth/it-is-a-beauteous-evening-calm-and-free.txt',
    start: /^  The holy time is quiet as a Nun$/,
    end: /^20\. TO THE MEMORY OF _RAISLEY CALVERT_\.$/,
  },
];

function sliceByMarkers(text, startRe, endRe, includeEnd = false, allowNoEnd = false) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const startIdx = lines.findIndex((line) => startRe.test(line));
  if (startIdx === -1) {
    throw new Error(`Start marker not found: ${startRe}`);
  }

  const endRelIdx = lines.slice(startIdx + 1).findIndex((line) => endRe.test(line));
  if (endRelIdx === -1 && !allowNoEnd) {
    throw new Error(`End marker not found: ${endRe}`);
  }
  const endIdx = endRelIdx === -1
    ? lines.length
    : startIdx + 1 + endRelIdx + (includeEnd ? 1 : 0);

  const out = lines.slice(startIdx, endIdx).join('\n').trimEnd();
  return `${out}\n`;
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function extractAmorMundi() {
  const res = await fetch('https://www.gutenberg.org/files/19188/19188-h/19188-h.htm');
  if (!res.ok) throw new Error(`Failed to fetch Amor Mundi source: ${res.status}`);
  const html = await res.text();

  const start = html.indexOf('name="p_267A"');
  const end = html.indexOf('name="p_269"');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not locate Amor Mundi section in Gutenberg source HTML');
  }

  let chunk = html.slice(start, end);
  chunk = chunk
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ');
  chunk = decodeHtmlEntities(chunk)
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s*267\s*$/gm, '')
    .replace(/^\s*Amor Mundi\s*$/gim, '')
    .trim();

  const lines = chunk.split('\n').map((l) => l.trimEnd());
  const startIdx = lines.findIndex((line) => /^O where are you going with your love-locks flowing\??$/i.test(line.trim()));
  if (startIdx === -1) {
    throw new Error('Failed to isolate Amor Mundi poem body');
  }

  const poem = lines.slice(startIdx).join('\n').trim();
  return `${poem}\n`;
}

async function main() {
  const repairs = [];

  for (const spec of REPAIRS) {
    const before = await fs.readFile(spec.file, 'utf8');
    const beforeLines = before.replace(/\r\n?/g, '\n').split('\n').length;
    const after = sliceByMarkers(before, spec.start, spec.end, spec.includeEnd, spec.allowNoEnd);
    const afterLines = after.replace(/\r\n?/g, '\n').split('\n').length;
    await fs.writeFile(spec.file, after, 'utf8');
    repairs.push({ file: spec.file, beforeLines, afterLines, mode: 'trim' });
  }

  const amorPath = 'poems/christina-rossetti/amor-mundi.txt';
  const amorBefore = await fs.readFile(amorPath, 'utf8');
  const amorBeforeLines = amorBefore.replace(/\r\n?/g, '\n').split('\n').length;
  const amorAfter = await extractAmorMundi();
  const amorAfterLines = amorAfter.replace(/\r\n?/g, '\n').split('\n').length;
  await fs.writeFile(amorPath, amorAfter, 'utf8');
  repairs.push({ file: amorPath, beforeLines: amorBeforeLines, afterLines: amorAfterLines, mode: 'source-replace' });

  const reportLines = [
    '# Corpus Repair Log (2026-03-04)',
    '',
    'Broad sanity pass for obviously corrupted short-poem files with oversized anthology/notes payloads.',
    '',
    '| File | Mode | Before (lines) | After (lines) |',
    '|---|---:|---:|---:|',
    ...repairs.map((r) => `| ${r.file} | ${r.mode} | ${r.beforeLines} | ${r.afterLines} |`),
    '',
    'Notes:',
    '- `trim`: extracted the intended poem body from existing file content by deterministic start/end markers.',
    '- `source-replace`: replaced with canonical public-domain source extraction from Project Gutenberg HTML (ebook 19188).',
  ];

  await fs.writeFile('docs/corpus-repair-2026-03-04.md', `${reportLines.join('\n')}\n`, 'utf8');

  for (const r of repairs) {
    console.log(`${r.file}: ${r.beforeLines} -> ${r.afterLines} (${r.mode})`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
