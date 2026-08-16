// Deduplicates research captures by Mobbin screen id across flows.
// - Registry: data/registry-dedupe.json (screen id -> canonical file)
// - A screen that already exists elsewhere becomes a hardlink (no duplicated bytes).
// Run after every download: node core/tools/dedupe-research.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const registryPath = path.join(root, 'data', 'registry-dedupe.json');

const registry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  : {};

function sanitizeApp(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_');
}

function numberedName(i, app) {
  return `${String(i + 1).padStart(2, '0')} - ${sanitizeApp(app || 'App')}.webp`;
}

function relFile(dir, file) {
  return path.relative(screensDir, path.join(dir, file)).split(path.sep).join('/');
}

function flowDirs() {
  const out = [];
  const walk = (base, depth) => {
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const dir = path.join(base, entry.name);
      if (fs.existsSync(path.join(dir, 'metadata.json'))) out.push(dir);
      else if (depth < 2) walk(dir, depth + 1);
    }
  };
  walk(screensDir, 0);
  return out;
}

let total = 0;
let duplicates = 0;
let linked = 0;
const first = new Map();

function replaceWithLink(abs, canonical) {
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  try { fs.linkSync(canonical, abs); }
  catch { fs.copyFileSync(canonical, abs); }
}

for (const flowDir of flowDirs()) {
  const metaPath = path.join(flowDir, 'metadata.json');
  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { continue; }
  const files = fs.readdirSync(flowDir).filter((f) => f.endsWith('.webp'));
  (meta.screens || []).forEach((screen, i) => {
    if (!screen || !screen.id) return;
    const file =
      files.find((f) => f.startsWith(`${screen.id}.`)) ||
      files.find((f) => f === numberedName(i, screen.app_name));
    if (!file) return;
    const abs = path.join(flowDir, file);
    const rel = relFile(flowDir, file);
    total += 1;

    const firstRel = first.get(screen.id);
    const existing = registry[screen.id];
    if (firstRel && firstRel !== rel) {
      replaceWithLink(abs, path.join(screensDir, firstRel));
      duplicates += 1;
      linked += 1;
      return;
    }
    if (existing && existing.file !== rel && fs.existsSync(path.join(screensDir, existing.file))) {
      replaceWithLink(abs, path.join(screensDir, existing.file));
      linked += 1;
    } else {
      registry[screen.id] = {
        file: rel,
        app: screen.app_name || file.replace(/\.webp$/, ''),
        mobbinUrl: screen.mobbin_url || null,
        addedAt: new Date().toISOString(),
      };
    }
    first.set(screen.id, registry[screen.id].file);
  });
}

fs.mkdirSync(path.dirname(registryPath), { recursive: true });
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
console.log(`Screens: ${total} | Duplicates avoided: ${duplicates} | Hardlinks created: ${linked}`);
