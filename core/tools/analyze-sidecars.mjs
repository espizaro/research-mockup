// Research Mockup analyze-sidecars — batch VLM analysis for screens without sidecars.
// Usage: node analyze-sidecars.mjs [--flow <name>] [--limit N] [--modlens <cli-js-path>]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fromModlens, readJson } from './schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const flowFilter = getArg('--flow');
const limit = parseInt(getArg('--limit') || '0', 10);
const cliPath = getArg('--modlens') || path.join(root, 'node_modules', '@liustack', 'modlens', 'dist', 'main.js');

const images = [];
for (const flowDir of fs.readdirSync(screensDir, { withFileTypes: true })) {
  if (!flowDir.isDirectory() || (flowFilter && flowDir.name !== flowFilter)) continue;
  const dir = path.join(screensDir, flowDir.name);
  for (const f of fs.readdirSync(dir)) {
    if (!f.toLowerCase().endsWith('.webp')) continue;
    const side = path.join(dir, 'sidecars', f.replace(/\.webp$/i, '.json'));
    if (!fs.existsSync(side)) images.push({ flow: flowDir.name, file: path.join(dir, f), base: f.replace(/\.webp$/i, '') });
  }
}
const todo = limit > 0 ? images.slice(0, limit) : images;
console.log(`analyze-sidecars: ${images.length} pending, processing ${todo.length}`);

const prompt = 'Analyze this UI screen for a design knowledge base: identify screen type, primary flow, UX intent, UX patterns, interaction elements, content blocks, visual keywords, accessibility notes and design system.';
const tmpOut = path.join(root, 'core', 'tools', '.tmp-modlens.json');
let done = 0;
for (const item of todo) {
  const args = ['-i', item.file, '-o', tmpOut, '--prompt', prompt, '--timeout', '120000'];
  const r = fs.existsSync(cliPath)
    ? spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8', timeout: 130000 })
    : spawnSync('npx', ['--yes', '@liustack/modlens', ...args], { encoding: 'utf8', timeout: 130000, shell: true });
  const result = readJson(tmpOut);
  if (r.status !== 0 || !result || !result.result) {
    console.log('skip', item.flow + '/' + item.base, r.status, String(r.stderr || r.stdout || '').slice(0, 200));
    continue;
  }
  const side = fromModlens(result.result, {
    flow: item.flow,
    platform: 'ios',
    file: `screens/${item.flow}/${item.base}.webp`,
    timestamp: result.meta && result.meta.generatedAt,
    rmId: `rm_${item.flow.replace(/[^a-z0-9]+/gi, '_')}_${item.base.split(' - ')[0] || 'x'}`
  });
  side.identification.app_name = guessApp(item.base);
  const sideDir = path.join(screensDir, item.flow, 'sidecars');
  fs.mkdirSync(sideDir, { recursive: true });
  fs.writeFileSync(path.join(sideDir, `${item.base}.json`), JSON.stringify(side, null, 2), 'utf8');
  done++;
  console.log('analyzed', item.flow + '/' + item.base);
}
console.log(`analyze-sidecars: ${done}/${todo.length} done`);

function guessApp(base) {
  const m = base.match(/^\d+\s*-\s*(.+)$/);
  return m ? m[1].trim() : base;
}
