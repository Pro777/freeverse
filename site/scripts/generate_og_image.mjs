import fs from 'fs/promises';
import path from 'path';
import { chromium } from '@playwright/test';

// Generates site/public/og.png (1200x630) using system fonts via headless Chromium.

const W = 1200;
const H = 630;

const outPath = path.resolve('public/og.png');

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    :root {
      --bg: #fbf7ee;
      --bg2: #f3efe6;
      --paper: #fffdf8;
      --ink: #1b1a16;
      --muted: #5b5750;
      --accent: #8a6a12;
    }
    html, body { height: 100%; margin: 0; }
    body {
      background:
        radial-gradient(1100px 680px at 18% 6%, color-mix(in oklab, var(--paper) 92%, transparent), transparent 60%),
        radial-gradient(850px 560px at 82% 12%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 55%),
        radial-gradient(900px 680px at 50% 110%, color-mix(in oklab, var(--ink) 10%, transparent), transparent 62%),
        linear-gradient(180deg, var(--bg), var(--bg2));
      display: grid;
      place-items: center;
      font-family: ui-serif, "Iowan Old Style", Palatino, Georgia, "Times New Roman", serif;
      color: var(--ink);
    }
    .card {
      width: ${W - 140}px;
      height: ${H - 140}px;
      background: rgba(255, 253, 248, 0.82);
      border: 1px solid rgba(27, 26, 22, 0.16);
      border-radius: 28px;
      box-shadow: 0 30px 80px rgba(27, 26, 22, 0.14);
      padding: 56px 64px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }
    .brand {
      font-weight: 800;
      font-size: 64px;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .tagline {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      font-size: 28px;
      color: var(--muted);
      margin: 12px 0 0;
    }
    .features {
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      font-size: 24px;
      color: color-mix(in oklab, var(--muted) 70%, var(--ink));
      margin: 28px 0 0;
    }
    .rule {
      margin-top: 30px;
      width: 120px;
      height: 4px;
      border-radius: 999px;
      background: color-mix(in oklab, var(--accent) 70%, var(--paper));
    }
    .sample {
      margin-top: 30px;
      padding: 22px 22px;
      background: rgba(255, 248, 228, 0.55);
      border: 1px solid rgba(27, 26, 22, 0.12);
      border-radius: 18px;
      line-height: 1.55;
      font-size: 26px;
      color: color-mix(in oklab, var(--ink) 92%, var(--muted));
    }
    .accent {
      position: absolute;
      right: 42px;
      top: 42px;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: var(--accent);
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="accent"></div>
    <h1 class="brand">Freeverse</h1>
    <p class="tagline">Public-domain poetry, pleasantly readable</p>
    <div class="rule"></div>
    <p class="features">Shareable line links • Search • Cozy reader</p>
    <div class="sample">“Because I could not stop for Death —<br/>He kindly stopped for me —”</div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(50);
const buf = await page.screenshot({ type: 'png' });
await browser.close();

await fs.writeFile(outPath, buf);
console.log(`wrote ${outPath}`);
