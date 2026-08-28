// Research Mockup build-plan-viewer
// Genera mockups/plans/<id>/index.html a partir de una definición JSON del plan.
// El viewer es 100% offline (file://): texto + screenshots locales de inspiración
// (Mobbin u otras) al lado de cada fase, navegable por chips / anterior / siguiente.
// Uso:
//   node core/tools/build-plan-viewer.mjs <path-to-plan.json>
// La definición puede ser un archivo .json o .mjs (default export).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

async function loadPlan(planPath) {
  const abs = path.resolve(planPath);
  if (!fs.existsSync(abs)) {
    console.error(`[build-plan-viewer] plan file not found: ${abs}`);
    process.exit(1);
  }
  if (abs.endsWith('.mjs')) {
    return { plan: (await import('file://' + abs.replaceAll('\\', '/'))).default, src: abs };
  }
  return { plan: JSON.parse(fs.readFileSync(abs, 'utf8')), src: abs };
}

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function relTo(fromDir, target) {
  const rel = path.relative(fromDir, path.resolve(root, target));
  return rel.split(path.sep).join('/');
}

let currentOutDir = root;

function refPath(ref) {
  const fromDir = currentOutDir;
  // ref puede ser: ruta absoluta, ruta relativa al root de la instancia, o URL remota.
  if (/^(https?:)?\/\//i.test(ref)) return ref;
  if (path.isAbsolute(ref)) return relTo(fromDir, ref.replace(/^[A-Za-z]:/, ''));
  return relTo(fromDir, path.resolve(root, ref));
}

function dimsOf(cap) {
  const w = cap?.width || cap?.w || null;
  const h = cap?.height || cap?.h || null;
  return w && h ? ` width="${w}" height="${h}"` : '';
}

function renderReferences(refs) {
  if (!Array.isArray(refs) || refs.length === 0) return '';
  return refs.map((r) => {
    const src = refPath(r.path || r.src || r);
    const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(src.split('?')[0]);
    if (!isImg) {
      return `<div class="ref ref-file"><span class="ref-badge">FILE</span><a href="${esc(src)}" target="_blank">${esc(r.caption || src)}</a></div>`;
    }
    return `<figure class="ref">
      <a href="${esc(src)}" target="_blank"><img src="${esc(src)}" alt="${esc(r.caption || 'referencia')}" loading="lazy"${dimsOf(r)}></a>
      <figcaption>${esc(r.caption || '')}</figcaption>
      ${r.url ? `<a class="ref-source" href="${esc(r.url)}" target="_blank">${esc(r.sourceLabel || 'ver origen')}</a>` : ''}
    </figure>`;
  }).join('');
}

function listBlock(label, arr) {
  return Array.isArray(arr) && arr.length
    ? `<div class="block"><h4>${label}</h4><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`
    : '';
}

function renderStep(step, i) {
  const count = (arr) => Array.isArray(arr) ? arr.length : 0;
  const chips = [];
  if (count(step.files)) chips.push(`<span class="chip">${count(step.files)} files</span>`);
  if (count(step.commands)) chips.push(`<span class="chip">${count(step.commands)} cmds</span>`);
  return `<section class="phase" data-phase="${i}">
    <div class="phase-head">
      <span class="phase-num">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3>${esc(step.title || `Fase ${i + 1}`)}</h3>
        ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
        ${step.summary ? `<p class="phase-summary">${esc(step.summary)}</p>` : ''}
      </div>
    </div>
    <div class="phase-body">
      <div class="phase-text">
        ${step.goal ? `<div class="block"><h4>Objetivo</h4><p>${esc(step.goal)}</p></div>` : ''}
        ${listBlock('Archivos', step.files)}
        ${listBlock('Comandos', step.commands)}
        ${listBlock('Verificación', step.checks)}
        ${step.notes ? `<div class="block"><h4>Notas</h4><p>${esc(step.notes)}</p></div>` : ''}
      </div>
      <div class="phase-refs">${renderReferences(step.refs)}</div>
    </div>
  </section>`;
}

function renderHtml(plan, outDir) {
  currentOutDir = outDir;
  const phases = Array.isArray(plan.phases) ? plan.phases : [];
  const title = esc(plan.title || 'Plan');
  const meta = plan.meta || {};
  const chips = (plan.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const nav = phases.length > 1 ? `
    <div class="plan-nav">
      <button id="prev" class="nav-btn" disabled>&larr; Anterior</button>
      <span id="phase-counter">1 / ${phases.length}</span>
      <button id="next" class="nav-btn">Siguiente &rarr;</button>
    </div>` : '';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Plan</title>
<link rel="stylesheet" href="../../assets/tokens.css">
<link rel="stylesheet" href="../../assets/base.css">
<style>
  .plan-shell { max-width: 1180px; margin: 0 auto; padding: 32px 24px 88px; }
  .plan-head { margin-bottom: 24px; }
  .plan-head h1 { font-size: var(--text-2xl); font-weight: var(--font-extrabold); letter-spacing: var(--tracking-title); }
  .plan-head .sub { color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: 6px; }
  .plan-head .tags { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .tag { font-size: 11px; font-weight: var(--font-semibold); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--color-primary-strong, var(--color-primary)); background: var(--color-primary-soft); padding: 4px 10px; border-radius: var(--radius-full); }
  .plan-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 24px 0; position: sticky; top: 12px; z-index: 5; background: var(--color-bg); padding: 10px; border-radius: var(--radius-2xl); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .nav-btn { padding: 9px 18px; border-radius: var(--radius-full); background: var(--color-primary-soft); color: var(--color-primary-strong, var(--color-primary)); font-weight: var(--font-semibold); }
  .nav-btn:disabled { opacity: 0.4; cursor: default; }
  #phase-counter { font-size: var(--text-sm); color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
  .phase { display: none; }
  .phase.active { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
  @media (max-width: 860px) { .phase.active { grid-template-columns: 1fr; } }
  .phase-head { grid-column: 1 / -1; display: flex; gap: 14px; align-items: flex-start; }
  .phase-num { font-size: var(--text-xl); font-weight: var(--font-extrabold); color: var(--color-primary); background: var(--color-primary-soft); width: 48px; height: 48px; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; flex: none; }
  .phase-head h3 { font-size: var(--text-lg); font-weight: var(--font-bold); letter-spacing: var(--tracking-title); }
  .phase-summary { color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: 4px; }
  .chips { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .chip { font-size: 11px; font-weight: var(--font-semibold); color: var(--color-text-secondary); border: 1px solid var(--color-border, rgba(128,128,128,0.35)); padding: 3px 9px; border-radius: var(--radius-full); }
  .phase-text .block { margin-bottom: 16px; background: var(--color-surface); border-radius: var(--radius-xl); padding: 14px 16px; }
  .block h4 { font-size: 11px; font-weight: var(--font-extrabold); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 8px; }
  .block ul { padding-left: 18px; }
  .block li { font-size: var(--text-sm); line-height: 1.55; margin-bottom: 4px; }
  .block p { font-size: var(--text-sm); line-height: 1.55; }
  .phase-refs { display: flex; flex-direction: column; gap: 16px; }
  .ref { margin: 0; background: var(--color-surface); border-radius: var(--radius-2xl); padding: 12px; }
  .ref a img { width: 100%; border-radius: var(--radius-xl); display: block; }
  .ref figcaption { font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 8px; line-height: 1.45; }
  .ref-source { display: inline-block; margin-top: 6px; font-size: 12px; font-weight: var(--font-semibold); color: var(--color-primary); text-decoration: none; }
  .ref-file { background: var(--color-surface); border-radius: var(--radius-xl); padding: 14px 16px; font-size: var(--text-sm); }
  .ref-badge { font-size: 10px; font-weight: var(--font-extrabold); letter-spacing: var(--tracking-eyebrow); color: var(--color-primary-strong, var(--color-primary)); background: var(--color-primary-soft); padding: 2px 7px; border-radius: var(--radius-full); margin-right: 8px; }
</style>
</head>
<body>
<div class="plan-shell">
  <header class="plan-head">
    <h1>${title}</h1>
    ${meta.date ? `<p class="sub">${esc(meta.date)}</p>` : ''}
    ${plan.summary ? `<p class="sub">${esc(plan.summary)}</p>` : ''}
    ${chips ? `<div class="tags">${chips}</div>` : ''}
  </header>
  ${nav}
  <main id="phases">
    ${phases.map((s, i) => renderStep(s, i)).join('')}
  </main>
</div>
<script>
(function () {
  const phases = Array.prototype.slice.call(document.querySelectorAll('.phase'));
  const counter = document.getElementById('phase-counter');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  let cur = 0;
  function show(i) {
    cur = Math.max(0, Math.min(phases.length - 1, i));
    phases.forEach(function (p, j) { p.classList.toggle('active', j === cur); });
    if (counter) counter.textContent = (cur + 1) + ' / ' + phases.length;
    if (prev) prev.disabled = cur === 0;
    if (next) next.disabled = cur === phases.length - 1;
    document.querySelector('.plan-shell').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (prev) prev.addEventListener('click', function () { show(cur - 1); });
  if (next) next.addEventListener('click', function () { show(cur + 1); });
  show(0);
})();
</script>
</body>
</html>`;
}

async function main() {
  const planPath = process.argv[2];
  if (!planPath) {
    console.error('Uso: node core/tools/build-plan-viewer.mjs <path-to-plan.json>');
    process.exit(1);
  }
  const { plan } = await loadPlan(planPath);
  const id = String(plan.id || 'plan').replace(/[^a-z0-9-_]+/gi, '_');
  const outDir = path.join(root, 'mockups', 'plans', id);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), renderHtml(plan, outDir), 'utf8');
  fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2), 'utf8');
  console.log(`[build-plan-viewer] ${path.relative(root, outDir)}/index.html (${Array.isArray(plan.phases) ? plan.phases.length : 0} fases)`);
}

await main();
