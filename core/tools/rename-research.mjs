// Renames downloaded research captures from UUID.webp to "NN - App.webp" using metadata.json.
// Usage: node core/tools/rename-research.mjs [optional-flow]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const only = process.argv[2];

function sanitize(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_');
}

function flowDirs() {
  const out = [];
  const walk = (base, depth) => {
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const dir = path.join(base, entry.name);
      if (fs.existsSync(path.join(dir, 'metadata.json'))) {
        out.push(path.relative(screensDir, dir).split(path.sep).join('/'));
      } else if (depth < 2) {
        walk(dir, depth + 1);
      }
    }
  };
  walk(screensDir, 0);
  return out;
}

const flows = flowDirs().filter((n) => !only || n.endsWith(path.sep + only) || n === only);

let renamed = 0;
for (const flow of flows) {
  const dir = path.join(screensDir, flow);
  const metaPath = path.join(dir, 'metadata.json');
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { continue; }
  const screens = meta.screens || [];
  if (!screens.length) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp'));
  screens.forEach((s, i) => {
    if (!s || !s.id) return;
    const old = `${s.id}.webp`;
    const newName = `${String(i + 1).padStart(2, '0')} - ${sanitize(s.app_name || 'App')}.webp`;
    if (old !== newName && files.includes(old)) {
      fs.renameSync(path.join(dir, old), path.join(dir, newName));
      renamed += 1;
    }
  });
}
console.log(`Renamed: ${renamed}`);
