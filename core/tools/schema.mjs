// Research Mockup sidecar schema helpers.
// Converts modlens JSON output into the rich record (4 layers).
import fs from 'node:fs';

const KEYWORDS = [
  'Bottom Sheet', 'Modal', 'Full Screen', 'List View', 'Grid View', 'Form',
  'Slider', 'Progress', 'FAB', 'Tabs', 'Skeleton', 'Empty State', 'Onboarding',
  'Checkout', 'Login', 'Search', 'Settings', 'Profile', 'Calendar', 'Chart',
  'Gamification', 'Dark Mode', 'Glassmorphism', 'Minimalist', 'Card', 'Carousel',
  'Stepper', 'Toggle', 'Checkbox', 'Radio', 'Chips', 'Segmented Control', 'Keypad'
];

function detectPatterns(result) {
  const hay = JSON.stringify(result).toLowerCase();
  const found = [];
  for (const k of KEYWORDS) if (hay.includes(k.toLowerCase())) found.push(k);
  const notes = (result.visual && result.visual.notes) || [];
  for (const n of notes) if (!found.includes(n)) found.push(n);
  return [...new Set(found)].slice(0, 12);
}

function detectPageStructure(result) {
  const regions = ((result.layout && result.layout.regions) || []).map(r => (r.type || '').toLowerCase());
  const out = [];
  const count = (t) => regions.filter(r => r === t).length;
  if (count('form')) out.push('Form');
  if (count('list')) out.push('List View');
  if (count('table')) out.push('Table');
  if (count('chart')) out.push('Chart');
  if (count('title')) out.push('Title Header');
  if (count('image')) out.push('Image Block');
  if (regions.length === 0) out.push('Unknown Layout');
  return out;
}

function detectInteractionElements(result) {
  const hay = (JSON.stringify(result) || '').toLowerCase();
  const out = [];
  for (const k of ['Primary CTA Button', 'Secondary Button', 'Toggle Switch', 'Slider', 'Text Input Field', 'Search Field', 'Bottom Navigation', 'Tab Bar', 'Floating Action Button', 'Progress Bar', 'Stepper', 'Chips', 'Checkbox', 'Radio Group', 'Keypad', 'Dropdown']) {
    if (hay.includes(k.toLowerCase())) out.push(k);
  }
  const notes = (result.visual && result.visual.notes) || [];
  for (const n of notes) if (n.toLowerCase().includes('button') || n.toLowerCase().includes('nav') || n.toLowerCase().includes('input') || n.toLowerCase().includes('action')) out.push(n);
  return [...new Set(out)].slice(0, 10);
}

function detectContentBlocks(result) {
  const entities = (((result.semantics && result.semantics.entities) || []));
  const names = entities.map(e => e.name).filter(Boolean).slice(0, 8);
  return names.length ? names : ['Unknown'];
}

function detectVisualKeywords(result) {
  const out = [];
  const v = result.visual || {};
  if (v.style) out.push(v.style);
  if (Array.isArray(v.dominant_colors)) out.push(...v.dominant_colors.map(c => String(c).replace(/^#/, 'hex ')));
  if (Array.isArray(v.notes)) out.push(...v.notes);
  return [...new Set(out)].slice(0, 10);
}

function screenType(result) {
  const scene = result.semantics && result.semantics.scene;
  if (scene) return scene;
  const regions = (result.layout && result.layout.regions) || [];
  const title = regions.find(r => r.type === 'title');
  return title ? title.text : 'Unknown';
}

function fromModlens(result, ctx = {}) {
  const app = ctx.app || 'Unknown';
  const flow = ctx.flow || 'Unknown';
  const file = ctx.file || 'placeholder.webp';
  const now = ctx.timestamp || new Date().toISOString();
  return {
    rm_id: ctx.rmId || `rm_${flow.replace(/[^a-z0-9]+/gi, '_')}_pending`,
    identification: {
      app_name: app,
      platform: ctx.platform || 'Unknown',
      file_path: file,
      analyzed_timestamp: now,
      source: 'mobbin'
    },
    context_and_flow: {
      screen_type: screenType(result),
      primary_flow: flow,
      ux_intent: (result.semantics && result.semantics.intent) || 'Pending analysis',
      ux_patterns: detectPatterns(result)
    },
    taxonomy_tags: {
      page_structure: detectPageStructure(result),
      interaction_elements: detectInteractionElements(result),
      content_blocks: detectContentBlocks(result),
      visual_keywords: detectVisualKeywords(result),
      industry_context: ctx.industry || 'Unknown'
    },
    technical_notes: {
      accessibility_audit: 'Pending manual audit',
      design_system_inference: (result.visual && result.visual.style) || 'Unknown'
    },
    analysis_status: 'enriched'
  };
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

export { fromModlens, readJson };
