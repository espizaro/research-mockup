// Embeds studio assets (icons and illustrations) as JS data so mockups work offline via file://.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const assetsDir = path.join(root, 'mockups', 'assets');
const iconsDir = path.join(assetsDir, 'icons');
const illusDir = path.join(assetsDir, 'illustrations');

function svgFor(file) {
  const raw = fs.readFileSync(file, 'utf8').trim();
  return raw.startsWith('<svg') ? raw : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${raw}</svg>`;
}

// --- icons ---
const iconNames = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.svg')).sort();
const icons = {};
for (const name of iconNames) {
  icons[name.replace(/\.svg$/, '')] = svgFor(path.join(iconsDir, name)).replace(/\s+/g, ' ');
}
fs.writeFileSync(
  path.join(assetsDir, 'icons.js'),
  'window.ICONS = ' + JSON.stringify(icons) + ';\n',
  'utf8',
);

// --- illustrations: embed every file, keyed by its relative path ---
const data = {};
if (fs.existsSync(illusDir)) {
  (function walk(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full, prefix + entry.name + '/'); continue; }
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
      const key = (prefix + entry.name.replace(/\.[^.]+$/, '')).replace(/\s+/g, '-').toLowerCase();
      data[key] = `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
    }
  })(illusDir, '');
}
fs.writeFileSync(
  path.join(assetsDir, 'illustrations.js'),
  'window.ILLUSTRATIONS = ' + JSON.stringify(data) + ';\n',
  'utf8',
);

console.log('Embedded icons:', Object.keys(icons).length);
console.log('Embedded illustrations:', Object.keys(data).length);
