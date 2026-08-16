// Screenshots the hub and every registered mockup in light and dark for visual review.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium } from './lib/playwright.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mockupsDir = path.join(root, 'mockups');
const outDir = path.join(root, 'work', 'shots');
fs.mkdirSync(outDir, { recursive: true });
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
    console.log('SKIP: Playwright is not installed. Run "npm i -D playwright" in the app repo to enable screenshots.');
    process.exit(0);
  }
  throw e;
}
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, channel: 'msedge' }); }
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 2 });

async function shot(name, sel = '.phone') {
  await page.waitForTimeout(420);
  const loc = page.locator(sel);
  if ((await loc.count()) === 0) { console.log('skip', name); return; }
  await loc.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log('shot', name);
}

await page.goto(fileUrl('index.html'));
await shot('hub-light', '.studio');
await page.click('[data-theme]').catch(() => {});
await shot('hub-dark', '.studio');
await page.click('[data-theme]').catch(() => {});

for (const m of mockups) {
  await page.goto(fileUrl(m.path));
  await shot(`${m.id}-light`);
  await page.goto(fileUrl(m.path) + '?theme=dark');
  await shot(`${m.id}-dark`);
}

await browser.close();
console.log(`shot-mockups: saved to ${outDir}`);
