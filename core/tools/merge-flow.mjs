// Research Mockup merge-flow — merges a downloaded Mobbin flow into screens/, deduped by api id.
// Usage: node merge-flow.mjs <srcDir> [targetName]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const srcDir = path.resolve(process.argv[2] || '');
const targetName = process.argv[3] || path.basename(srcDir);
if (!fs.existsSync(srcDir)) { console.log('Source directory not found:', srcDir); process.exit(1); }

const target = path.join(screensDir, targetName);
fs.mkdirSync(target, { recursive: true });
fs.mkdirSync(path.join(target, 'sidecars'), { recursive: true });

const registry = readJson(path.join(root, 'data', 'registry.json'));
const existingIds = new Set((registry && registry.screens || []).map(s => s.api_id));
const targetMetaPath = path.join(target, 'metadata.json');
const targetMeta = readJson(targetMetaPath);
const merged = targetMeta && Array.isArray(targetMeta.screens) ? targetMeta.screens : [];
for (const s of merged) if (s.id) existingIds.add(s.id);

const srcMeta = readJson(path.join(srcDir, 'metadata.json'));
if (!srcMeta || !Array.isArray(srcMeta.screens)) { console.log('Source has no valid metadata.json:', srcDir); process.exit(1); }

const srcWebp = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.webp')).sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b));
const usedNums = new Set();
merged.forEach(s => {
  const m = (s.local_path || s.file || '').match(/^(\d+)\s*-\s*.*\.webp$/i);
  if (m) usedNums.add(parseInt(m[1], 10));
});
fs.readdirSync(target).filter(f => f.toLowerCase().endsWith('.webp')).forEach(f => {
  const m = f.match(/^(\d+)\s*-\s*.*\.webp$/i);
  if (m) usedNums.add(parseInt(m[1], 10));
});
let nextNum = 1;
while (usedNums.has(nextNum)) nextNum++;

let added = 0, skipped = 0;
srcMeta.screens.forEach((s, i) => {
  if (!s.id || existingIds.has(s.id)) { skipped++; return; }
  let base = srcWebp[i] || (s.local_path ? path.basename(s.local_path) : '');
  if (!base || !fs.existsSync(path.join(srcDir, base))) {
    const cand = srcWebp.find(f => (s.app_name || '').toLowerCase().split(' ')[0] && f.toLowerCase().includes(s.app_name.toLowerCase().split(' ')[0]));
    base = cand || srcWebp[i] || `0${i + 1} - ${s.app_name || 'Unknown'}.webp`;
  }
  if (!fs.existsSync(path.join(srcDir, base))) { skipped++; return; }
  const num = String(nextNum++).padStart(2, '0');
  const newBase = `${num} - ${s.app_name || 'Unknown'}.webp`;
  fs.copyFileSync(path.join(srcDir, base), path.join(target, newBase));
  const sideSrc = path.join(srcDir, 'sidecars', base.replace(/\.webp$/i, '.json'));
  if (fs.existsSync(sideSrc)) fs.copyFileSync(sideSrc, path.join(target, 'sidecars', newBase.replace(/\.webp$/i, '.json')));
  merged.push({ ...s, local_path: newBase });
  existingIds.add(s.id);
  added++;
});

fs.writeFileSync(targetMetaPath, JSON.stringify({ ...(targetMeta || {}), screens: merged }, null, 2), 'utf8');
console.log(`merge ${targetName}: +${added} added, ${skipped} duplicates/skipped (total ${merged.length})`);
