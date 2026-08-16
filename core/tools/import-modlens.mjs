// Research Mockup import-modlens — converts previous modlens JSON analyses into sidecars.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromModlens, readJson } from './schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const resultsDir = process.argv[2] || path.join(root, 'work', 'modlens-results');

function findImages(screensDir, flow, base) {
  const start = path.join(screensDir, flow);
  if (!fs.existsSync(start)) return [];
  const found = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'sidecars') walk(full); }
      else if (e.name === `${base}.webp`) found.push(full);
    }
  })(start);
  return found;
}

function scoreCandidate(imgPath, base) {
  const dir = path.dirname(imgPath);
  const meta = readJson(path.join(dir, 'metadata.json'));
  let score = 0;
  if (meta && Array.isArray(meta.screens)) {
    score += 1;
    if (meta.screens.some(s => path.basename(s.local_path || '').replace(/\.webp$/i, '') === base)) score += 2;
  }
  return score;
}

let converted = 0;
let skipped = 0;
for (const flowDir of fs.readdirSync(resultsDir, { withFileTypes: true })) {
  if (!flowDir.isDirectory()) continue;
  const flow = flowDir.name;
  const dir = path.join(resultsDir, flow);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const base = f.replace(/\.json$/i, '');
    const candidates = findImages(screensDir, flow, base);
    if (!candidates.length) { skipped++; continue; }
    const result = readJson(path.join(dir, f));
    if (!result || !result.result) { skipped++; continue; }
    candidates.sort((a, b) => scoreCandidate(b, base) - scoreCandidate(a, base));
    const img = candidates[0];
    const sideDir = path.join(path.dirname(img), 'sidecars');
    const rel = path.relative(screensDir, img).split(path.sep).join('/');
    const side = fromModlens(result.result, {
      flow: path.relative(screensDir, path.dirname(img)).split(path.sep).join('/'),
      platform: 'ios',
      file: `screens/${rel}`,
      timestamp: result.meta && result.meta.generatedAt,
      rmId: `rm_${flow.replace(/[^a-z0-9]+/gi, '_')}_${base.split(' - ')[0] || 'x'}`
    });
    side.identification.app_name = guessApp(base);
    fs.mkdirSync(sideDir, { recursive: true });
    fs.writeFileSync(path.join(sideDir, `${base}.json`), JSON.stringify(side, null, 2), 'utf8');
    converted++;
  }
}
console.log(`import-modlens: ${converted} converted, ${skipped} skipped`);

function guessApp(base) {
  const m = base.match(/^\d+\s*-\s*(.+)$/);
  return m ? m[1].trim() : base;
}
