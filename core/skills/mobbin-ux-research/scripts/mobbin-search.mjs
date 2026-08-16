#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf("--" + name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const query = getArg("query", "");
const platform = getArg("platform", "");
const limit = Math.min(parseInt(getArg("limit", "10"), 10) || 10, 50);
const out = getArg("out", "");
const downloadDir = getArg("download-dir", "");
const keyFile = getArg("key-file", "");

if (!query) {
  console.error(
    'Usage: node mobbin-search.mjs --query "<text>" [--platform ios|web] [--limit N] [--out file.json] [--download-dir folder] [--key-file path]'
  );
  process.exit(1);
}

function loadKey() {
  if (process.env.MOBBIN_API_KEY) return process.env.MOBBIN_API_KEY.trim();
  const candidates = [];
  if (keyFile) candidates.push(keyFile);
  candidates.push(path.join(process.cwd(), "work", "api_keys.txt"));
  candidates.push(path.join(process.cwd(), "api_keys.txt"));
  for (const f of candidates) {
    if (!fs.existsSync(f)) continue;
    const line = fs
      .readFileSync(f, "utf8")
      .split(/\r?\n/)
      .find((l) => /^MOBBIN_API_KEY\s*=/.test(l));
    if (line) return line.replace(/^MOBBIN_API_KEY\s*=\s*/, "").trim();
  }
  return "";
}

const key = loadKey();
if (!key) {
  console.error(
    "ERROR: MOBBIN_API_KEY not found (environment variable, work/api_keys.txt, or --key-file)."
  );
  process.exit(1);
}

const body = { query, limit };
if (platform) body.platform = platform;

const res = await fetch("https://api.mobbin.com/v1/screens/search", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (res.status === 429) {
  console.error(
    "ERROR 429: API rate limit reached. Wait and retry, lower --limit, or use the browser."
  );
  process.exit(2);
}
if (!res.ok) {
  console.error(`ERROR ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
const screens = data.screens || [];

if (downloadDir) {
  fs.mkdirSync(downloadDir, { recursive: true });
  for (const s of screens) {
    const urlPath = new URL(s.image_url).pathname;
    const ext = path.extname(urlPath) || ".webp";
    const file = path.join(downloadDir, `${s.id}${ext}`);
    try {
      const img = await fetch(s.image_url);
      if (!img.ok) {
        console.error(`Could not download ${s.id}: ${img.status}`);
        continue;
      }
      fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
      s.local_path = file;
    } catch (e) {
      console.error(`Error downloading ${s.id}: ${e.message}`);
    }
  }
}

if (out) fs.writeFileSync(out, JSON.stringify(data, null, 2));
process.stdout.write(JSON.stringify({ screens }, null, 2));
