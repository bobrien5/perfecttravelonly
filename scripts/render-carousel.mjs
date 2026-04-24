#!/usr/bin/env node
// Render a VacationPro carousel HTML file to individual 2160x2160 PNG slides.
// Usage: node scripts/render-carousel.mjs <path-to-html> <out-dir>

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const [, , htmlPath, outDir] = process.argv;
if (!htmlPath || !outDir) {
  console.error('usage: node render-carousel.mjs <html> <outDir>');
  process.exit(1);
}
if (!fs.existsSync(htmlPath)) {
  console.error(`HTML file not found: ${htmlPath}`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  args: ['--allow-file-access-from-files', '--disable-web-security'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: 'networkidle0' });

// Wait for Inter font to load
await page.evaluateHandle('document.fonts.ready');

// Wait for all CSS background-images AND <img> tags to finish loading
await page.evaluate(async () => {
  const bgUrls = Array.from(document.querySelectorAll('*'))
    .map(el => getComputedStyle(el).backgroundImage)
    .filter(bg => bg && bg !== 'none')
    .map(bg => {
      const m = bg.match(/url\(["']?(.+?)["']?\)/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const imgSrcs = Array.from(document.images).map(img => img.src);
  const allUrls = [...new Set([...bgUrls, ...imgSrcs])];
  await Promise.all(allUrls.map(url => new Promise(resolve => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  })));
});

const slides = await page.$$('.slide');
console.log(`Found ${slides.length} slides. Rendering…`);

for (let i = 0; i < slides.length; i++) {
  const out = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
  await slides[i].screenshot({ path: out });
  console.log(`  ✓ ${out}`);
}

await browser.close();
console.log(`Done. ${slides.length} slides rendered to ${outDir}`);
