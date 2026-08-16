// Headless verification of every registered mockup: no broken images, icons injected, no console errors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium } from './lib/playwright.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mockupsDir = path.join(root, 'mockups');
const fileUrl = (rel) => 'file:///' + path.join(mockupsDir, rel).replace(/\\/g, '/');

const raw = fs.readFileSync(path.join(mockupsDir, 'assets', 'mockups.js'), 'utf8');
const match = raw.match(/window\.MOCKUPS\s*=\s*(\[[\s\S]*\])\s*;?/);
if (!match) { console.error('assets/mockups.js does not define window.MOCKUPS'); process.exit(1); }
const mockups = JSON.parse(match[1].replace(/,\s*([\]}])/g, '$1'));

let chromium;
try {
  chromium = await loadChromium();
} catch (e) {
  if (/Playwright/i.test(String((e && e.message) || e))) {
    console.log('SKIP: Playwright is not installed. Run "npm i -D playwright" in the app repo to enable headless verification.');
    process.exit(0);
  }
  throw e;
}
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, channel: 'msedge' }); }
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 } });

const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + String(e)));

await page.goto(fileUrl('index.html'));
await page.waitForTimeout(500);
for (const m of mockups) {
  const linked = await page.locator(`a.mock-card[href^="${m.path}"]`).count();
  if (linked !== 1) problems.push(`hub does not link mockup "${m.id}" exactly once (found ${linked})`);
}

for (const m of mockups) {
  for (const theme of ['light', 'dark']) {
    await page.goto(fileUrl(m.path) + '?theme=' + theme);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      iconsInjected: document.querySelectorAll('[data-icon] svg').length,
      iconTargets: document.querySelectorAll('[data-icon]').length,
      brokenImgs: [...document.images].filter((i) => i.naturalWidth === 0).length,
      screens: document.querySelectorAll('.screen').length,
    }));
    if (r.brokenImgs > 0) problems.push(`${m.id} (${theme}): ${r.brokenImgs} broken image(s)`);
    if (r.iconTargets > r.iconsInjected) problems.push(`${m.id} (${theme}): ${r.iconTargets - r.iconsInjected} icon(s) not injected`);
    console.log(`${m.id} ${theme}: screens=${r.screens} icons=${r.iconsInjected}/${r.iconTargets} broken=${r.brokenImgs}`);
  }
}

await browser.close();
if (problems.length) {
  console.error('PROBLEMS');
  problems.forEach((p) => console.error(' -', p));
  process.exit(1);
}
console.log(`check-mockups: OK (${mockups.length} mockups, light + dark)`);
