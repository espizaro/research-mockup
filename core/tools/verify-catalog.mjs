// Headless verification of the inspiration catalog: loads, searches, previews, no console errors.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadChromium } from './lib/playwright.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const catalogUrl = 'file:///' + path.join(root, 'catalog', 'index.html').replace(/\\/g, '/');

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
try {
  browser = await chromium.launch({ headless: true });
} catch {
  browser = await chromium.launch({ headless: true, channel: 'msedge' });
}
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto(catalogUrl);
await page.waitForTimeout(1200);

const total = await page.locator('.card').count();
const broken = await page.evaluate(() =>
  [...document.images].filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0).length
);
const countText = await page.locator('#count').textContent();

await page.fill('#search', 'onboarding');
await page.waitForTimeout(400);
const filtered = await page.locator('.card').count();
await page.fill('#search', '');
await page.waitForTimeout(400);

if (total > 0) {
  await page.locator('.card').first().click();
  await page.waitForTimeout(400);
}
const previewVisible = total > 0 ? await page.locator('#preview').isVisible() : true;
const jsonLen = total > 0 ? (await page.locator('#pvJson').textContent()).length : 0;
const imgOk = total > 0 ? await page.evaluate(() => document.getElementById('pvImg').naturalWidth > 0) : true;
if (total > 0) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
const previewClosed = total > 0 ? await page.locator('#pvContent').isHidden() : true;

console.log(JSON.stringify({ total, broken, countText, filtered, previewVisible, jsonLen, imgOk, previewClosed, errors }, null, 2));
await browser.close();
if (broken > 0 || errors.length > 0 || !previewClosed) process.exit(1);
