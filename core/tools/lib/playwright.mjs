// Resolves Playwright from the app repo, this instance, or the global npm root.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export async function loadChromium() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const candidates = [];
  try {
    const raw = fs.readFileSync(path.join(root, 'instance', 'choices.json'), 'utf8').replace(/^\uFEFF/, '');
    const choices = JSON.parse(raw);
    if (choices.appRepoPath) candidates.push(path.join(choices.appRepoPath, 'node_modules'));
  } catch {}
  candidates.push(path.join(root, 'node_modules'));
  try {
    const globalRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout.trim();
    if (globalRoot) candidates.push(globalRoot);
  } catch {}

  for (const dir of candidates) {
    try {
      const require = createRequire(path.join(dir, 'playwright', 'index.mjs'));
      const pw = require('playwright');
      if (pw && pw.chromium) return pw.chromium;
    } catch {}
  }
  throw new Error(
    'Playwright was not found. Install it in the app repo or this instance with: npm i -D playwright'
  );
}
