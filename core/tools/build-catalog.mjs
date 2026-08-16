// Research Mockup build-catalog — generates data/registry.json + catalog/data.js from screens/**/metadata.json + sidecars.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './schema.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const screensDir = path.join(root, 'screens');

function walkMeta(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'sidecars') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMeta(full, out);
    else if (entry.name === 'metadata.json') out.push(full);
  }
  return out;
}

function webpFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith('.webp'))
    .sort((a, b) => {
      const na = parseInt(a, 10) || 0;
      const nb = parseInt(b, 10) || 0;
      return na - nb || a.localeCompare(b);
    });
}

const metas = walkMeta(screensDir);
const records = [];
const seen = new Set();
const warnings = [];

for (const metaPath of metas) {
  const flow = path.relative(screensDir, path.dirname(metaPath)).split(path.sep).join('/');
  const meta = readJson(metaPath);
  if (!meta || !Array.isArray(meta.screens)) continue;
  const files = webpFiles(path.dirname(metaPath));
  meta.screens.forEach((s, i) => {
    if (!s.id || seen.has(s.id)) return;
    seen.add(s.id);
    // Pair by ordinal first (files are renamed NN - App.webp); fallback to metadata local basename.
    let base = files[i] || path.basename(s.local_path || '');
    if (!files[i] && !base.toLowerCase().endsWith('.webp')) base = `${String(i + 1).padStart(2, '0')} - ${s.app_name || 'Unknown'}.webp`;
    const file = `screens/${flow}/${base}`;
    const sidecar = readJson(path.join(screensDir, flow, 'sidecars', base.replace(/\.webp$/i, '.json')));
    const flowLabel = flow.includes('/') ? flow.slice(flow.lastIndexOf('/') + 1) : flow;
    const rmId = `rm_${flowLabel.replace(/[^a-z0-9]+/gi, '_')}_${String(i + 1).padStart(3, '0')}`;
    records.push({
      rm_id: (sidecar && sidecar.rm_id) || rmId,
      api_id: s.id,
      identification: {
        app_name: (sidecar && sidecar.identification && sidecar.identification.app_name) || s.app_name || 'Unknown',
        platform: (sidecar && sidecar.identification && sidecar.identification.platform) || s.platform || 'Unknown',
        file_path: file,
        analyzed_timestamp: sidecar && sidecar.identification && sidecar.identification.analyzed_timestamp
      },
      context_and_flow: (sidecar && sidecar.context_and_flow) || { screen_type: 'Pending analysis', primary_flow: flow, ux_intent: 'Pending analysis', ux_patterns: [] },
      taxonomy_tags: (sidecar && sidecar.taxonomy_tags) || { page_structure: [], interaction_elements: [], content_blocks: [], visual_keywords: [], industry_context: [] },
      technical_notes: (sidecar && sidecar.technical_notes) || { accessibility_audit: 'Pending manual audit', design_system_inference: 'Unknown' },
      analysis_status: sidecar ? 'enriched' : 'pending',
      links: { mobbin_url: s.mobbin_url || `https://mobbin.com/screens/${s.id}`, flow }
    });
    if (!fs.existsSync(path.join(screensDir, flow, base))) warnings.push(`missing file: ${file}`);
  });
}

records.sort((a, b) => a.links.flow.localeCompare(b.links.flow) || a.api_id.localeCompare(b.api_id));
const registry = { generatedAt: new Date().toISOString(), count: records.length, screens: records };

const compact = records.map(r => ({
  id: r.api_id,
  app: r.identification.app_name,
  platform: r.identification.platform,
  flow: r.links.flow,
  file: r.identification.file_path,
  url: r.links.mobbin_url,
  status: r.analysis_status,
  screen_type: r.context_and_flow.screen_type,
  intent: r.context_and_flow.ux_intent,
  patterns: r.context_and_flow.ux_patterns || [],
  tags: [
    ...(r.taxonomy_tags.page_structure || []),
    ...(r.taxonomy_tags.interaction_elements || []),
    ...(r.taxonomy_tags.content_blocks || []),
    ...(r.taxonomy_tags.visual_keywords || [])
  ]
}));

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.mkdirSync(path.join(root, 'catalog'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'registry.json'), JSON.stringify(registry, null, 2), 'utf8');
fs.writeFileSync(path.join(root, 'catalog', 'data.js'), `window.RESEARCH_MOCKUP_DATA = ${JSON.stringify({ generatedAt: registry.generatedAt, screens: compact })};\nwindow.RESEARCH_MOCKUP_FULL = ${JSON.stringify({ screens: records })};\n`, 'utf8');

const enriched = records.filter(r => r.analysis_status === 'enriched').length;
console.log(`Catalog: ${records.length} screens (${enriched} enriched), ${warnings.length} missing files`);
if (warnings.length) console.log(warnings.slice(0, 10).join('\n'));
