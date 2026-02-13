#!/usr/bin/env node
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const outPath = process.argv[2] || path.resolve('public/og.png');

// Simple, evocative OG card: poem-ish "sample card" with crisp typography.
// Rendered via Chromium → screenshot for reliable PNG output.
const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root{
        --bg:#f6f2ea;
        --ink:#1c2a3a;
        --muted:#536174;
        --card:#fbf8f3;
        --shadow: rgba(28,42,58,0.18);
        --shadow2: rgba(28,42,58,0.08);
        --accent:#b8a06a;
      }
      *{box-sizing:border-box;}
      html,body{height:100%; margin:0;}
      body{
        width:${WIDTH}px;
        height:${HEIGHT}px;
        background:
          radial-gradient(1200px 630px at 20% 15%, rgba(184,160,106,0.10), transparent 55%),
          radial-gradient(1000px 600px at 85% 80%, rgba(28,42,58,0.06), transparent 55%),
          var(--bg);
        display:flex;
        align-items:center;
        justify-content:center;
        font-family: ui-serif, Georgia, 'Times New Roman', Times, serif;
        color:var(--ink);
      }

      .card{
        width: 980px;
        padding: 54px 72px;
        background: var(--card);
        border-radius: 28px;
        box-shadow:
          0 26px 60px var(--shadow2),
          0 12px 24px var(--shadow);
        border: 1px solid rgba(28,42,58,0.08);
      }

      .top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom: 26px;
      }

      .brand{
        font-family: ui-serif, Georgia, 'Times New Roman', Times, serif;
        font-size: 28px;
        letter-spacing: 0.8px;
      }

      .rule{
        height:1px;
        background: linear-gradient(90deg, transparent, rgba(184,160,106,0.9), transparent);
        margin: 18px 0 34px;
      }

      .tagline{
        font-family: ui-serif, Georgia, 'Times New Roman', Times, serif;
        font-style: italic;
        font-size: 32px;
        color: var(--muted);
        text-align:center;
        margin: 0 0 22px;
      }

      .quote{
        font-size: 72px;
        line-height: 1.08;
        text-align:center;
        margin: 0;
        letter-spacing: -0.6px;
      }

      .sub{
        font-size: 32px;
        line-height: 1.28;
        text-align:center;
        margin: 22px 0 0;
        color: rgba(28,42,58,0.35);
      }

      .hint{
        margin-top: 34px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap: 14px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        letter-spacing: 0.6px;
        color: rgba(28,42,58,0.35);
        font-size: 14px;
        text-transform: uppercase;
      }
      .dot{width:6px;height:6px;border-radius:999px;background:rgba(184,160,106,0.8)}
    </style>
  </head>
  <body>
    <main class="card">
      <div class="top">
        <div class="brand">Freeverse</div>
        <div aria-hidden="true" style="color:rgba(184,160,106,0.85); font-size:14px; letter-spacing:1.4px; font-family: ui-sans-serif, system-ui; text-transform:uppercase;">Poetry</div>
      </div>
      <div class="tagline">Pleasantly readable — easy to share</div>
      <div class="rule"></div>
      <p class="quote">I shall not wholly die.</p>
      <p class="sub">I shall not wholly die.</p>
      <div class="hint"><span class="dot"></span><span>thefreeverse.org</span><span class="dot"></span></div>
    </main>
  </body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });

  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(50);

  // Screenshot only the body; it is fixed-size.
  await page.screenshot({ path: outPath, type: 'png' });
} finally {
  await browser.close();
}

// Quick sanity: ensure file exists and is non-trivial.
const stat = await fs.stat(outPath);
if (stat.size < 50_000) {
  throw new Error(`OG output too small (${stat.size} bytes): ${outPath}`);
}

console.log(`Wrote ${outPath} (${stat.size} bytes)`);
