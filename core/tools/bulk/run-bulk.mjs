import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const root = path.resolve(here, '..', '..', '..'); // bulk/ -> tools/ -> core/ -> instance root
const queries = JSON.parse(fs.readFileSync(path.join(here, 'queries.json'), 'utf8'));
const args = process.argv.slice(2);
const get = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const from = parseInt(get('--from', '0'), 10);
const to = parseInt(get('--to', String(queries.length)), 10);
const staging = get('--staging', path.join(os.tmpdir(), 'research-mockup-bulk'));
const script = get('--script', path.join(root, 'core', 'skills', 'mobbin-ux-research', 'scripts', 'mobbin-search.mjs'));
const keyFile = get('--key-file', path.join(root, 'instance', '.env'));
const nodeCmd = process.execPath;

let ok = 0, fail = 0;
for (let i = from; i < Math.min(to, queries.length); i++) {
  const q = queries[i];
  const dir = path.join(staging, q.flow);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'metadata.json');
  const cmd = [
    script, '--query', q.query, '--platform', q.platform, '--limit', String(q.limit),
    '--out', out, '--download-dir', dir, '--key-file', keyFile
  ];
  const r = spawnSync(nodeCmd, cmd, { encoding: 'utf8', timeout: 120000 });
  const metaOk = fs.existsSync(out);
  const imgs = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.webp')).length : 0;
  if (r.status === 0 && metaOk && imgs > 0) {
    ok++;
    console.log(`OK [${i}] ${q.flow} -> ${imgs} imgs`);
  } else {
    fail++;
    console.log(`FAIL [${i}] ${q.flow} status=${r.status} meta=${metaOk} imgs=${imgs}`);
    if (r.stderr) console.log(String(r.stderr).slice(0, 400));
  }
  await new Promise(res => setTimeout(res, 700));
}
console.log(`BATCH ${from}-${to}: ok=${ok} fail=${fail}`);
