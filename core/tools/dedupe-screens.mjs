// Research Mockup dedupe-screens — reports duplicate images by content hash.
// Usage: node dedupe-screens.mjs  (read-only report)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const byHash = new Map();

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'sidecars') walk(full); }
    else if (e.name.toLowerCase().endsWith('.webp')) {
      const hash = crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex');
      if (!byHash.has(hash)) byHash.set(hash, []);
      byHash.get(hash).push(path.relative(screensDir, full));
    }
  }
}
walk(screensDir);
let dupes = 0;
for (const [hash, files] of byHash) {
  if (files.length > 1) { dupes++; console.log('DUP', hash.slice(0, 10), files.join(' | ')); }
}
console.log(`dedupe-screens: ${byHash.size} unique, ${dupes} duplicate groups`);
