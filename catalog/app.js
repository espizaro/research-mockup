(function () {
  const data = window.RESEARCH_MOCKUP_DATA || { screens: [] };
  const screens = data.screens;
  const state = { q: '', platform: 'all', status: 'all', flow: '', app: '', sort: 'flow' };
  let currentId = null;

  const $ = (id) => document.getElementById(id);
  const grid = $('grid'), count = $('count'), empty = $('empty');

  /* ---------- Theme ---------- */
  const themeBtn = $('theme');
  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    themeBtn.textContent = dark ? '☀' : '☾';
    try { localStorage.setItem('catalog-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('catalog-theme'); } catch (e) {}
  if (saved) applyTheme(saved === 'dark');
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme(true);
  else applyTheme(false);
  themeBtn.addEventListener('click', () => applyTheme(!document.documentElement.classList.contains('dark')));

  /* ---------- Filters ---------- */
  function unique(values) { return [...new Set(values.filter(Boolean))].sort(); }
  function renderChips() {
    const platformChips = $('platformChips'), statusChips = $('statusChips');
    platformChips.innerHTML = ''; statusChips.innerHTML = '';
    const plats = ['all', ...unique(screens.map(s => s.platform))];
    const stats = ['all', ...unique(screens.map(s => s.status))];
    plats.forEach(v => {
      const b = document.createElement('button');
      b.className = 'chip' + (state.platform === v ? ' on' : '');
      b.textContent = v === 'all' ? 'All platforms' : v;
      b.addEventListener('click', () => { state.platform = v; renderChips(); render(); });
      platformChips.appendChild(b);
    });
    stats.forEach(v => {
      const b = document.createElement('button');
      b.className = 'chip' + (state.status === v ? ' on' : '');
      b.textContent = v === 'all' ? 'All statuses' : (v === 'enriched' ? 'Enriched' : 'Pending');
      b.addEventListener('click', () => { state.status = v; renderChips(); render(); });
      statusChips.appendChild(b);
    });
  }
  function fillSelect(sel, values, allLabel, key) {
    const cur = sel.value;
    sel.innerHTML = '';
    const optAll = document.createElement('option');
    optAll.value = ''; optAll.textContent = allLabel;
    sel.appendChild(optAll);
    values.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    });
    if (cur) sel.value = cur;
    sel.onchange = () => { state[key] = sel.value; render(); };
  }
  function matches(s) {
    if (state.platform !== 'all' && (s.platform || '').toLowerCase() !== state.platform.toLowerCase()) return false;
    if (state.status !== 'all' && s.status !== state.status) return false;
    if (state.flow && s.flow !== state.flow) return false;
    if (state.app && s.app !== state.app) return false;
    const q = state.q.trim().toLowerCase();
    if (!q) return true;
    const hay = [s.app, s.flow, s.screen_type, s.intent, ...(s.patterns || []), ...(s.tags || [])].join(' ').toLowerCase();
    return hay.includes(q);
  }

  /* ---------- Render ---------- */
  function render() {
    const list = screens.filter(matches);
    list.sort((a, b) => (a.flow || '').localeCompare(b.flow || '') || (a.app || '').localeCompare(b.app || ''));
    grid.innerHTML = '';
    setText(count, `${list.length} / ${screens.length} screens`);
    empty.hidden = list.length !== 0;
    if (!list.length) { $('emptyClear').onclick = clearFilters; return; }
    list.forEach(s => {
      const card = document.createElement('button');
      card.className = 'card' + (s.id === currentId ? ' sel' : '');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = '../' + s.file;
      img.alt = s.app + ' · ' + s.flow;
      img.onerror = () => { img.style.opacity = '.25'; };
      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `<div class="card-app"></div><div class="card-flow"></div><div class="card-meta"><span class="badge ${s.status}"></span><span class="badge">${s.platform || '?'}</span></div>`;
      body.querySelector('.card-app').textContent = s.app || 'Unknown';
      body.querySelector('.card-flow').textContent = s.flow || '';
      body.querySelector('.badge').textContent = s.status || 'pending';
      card.dataset.id = s.id;
      card.appendChild(img); card.appendChild(body);
      card.addEventListener('click', () => openPreview(s));
      grid.appendChild(card);
    });
  }
  function setText(el, v) { el.textContent = v; }

  /* ---------- Preview ---------- */
  function openPreview(s) {
    currentId = s.id;
    grid.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.id === s.id));
    $('pvEmpty').hidden = true;
    $('pvContent').hidden = false;
    $('pvApp').textContent = s.app || 'Unknown';
    $('pvFlow').textContent = s.flow || '';
    $('pvType').textContent = s.screen_type || 'No analysis yet';
    $('pvIntent').textContent = s.intent || 'No intent analysis yet.';
    $('pvPlatform').textContent = s.platform || '?';
    $('pvStatus').textContent = s.status || 'pending';
    const img = $('pvImg'); img.src = '../' + s.file;
    const pats = $('pvPatterns'); pats.innerHTML = '';
    (s.patterns || []).slice(0, 12).forEach(t => pats.appendChild(chipEl(t)));
    const tags = $('pvTags'); tags.innerHTML = '';
    (s.tags || []).slice(0, 30).forEach(t => tags.appendChild(chipEl(t)));
    $('pvJson').textContent = JSON.stringify(registryRecord(s), null, 2);
    $('pvMobbin').href = s.url || 'https://mobbin.com';
    if (window.innerWidth < 1100) $('preview').classList.add('open');
  }
  function chipEl(t) { const c = document.createElement('span'); c.className = 'chip'; c.textContent = t; return c; }
  function registryRecord(s) {
    const full = (window.RESEARCH_MOCKUP_FULL || {}).screens || [];
    return full.find(r => r.api_id === s.id) || { api_id: s.id, app: s.app, status: s.status };
  }
  function closePreview() {
    currentId = null;
    $('pvEmpty').hidden = false;
    $('pvContent').hidden = true;
    document.querySelectorAll('.card.sel').forEach(c => c.classList.remove('sel'));
    $('preview').classList.remove('open');
  }
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closePreview));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePreview(); });
  $('pvCopy').addEventListener('click', () => {
    navigator.clipboard.writeText($('pvJson').textContent).then(() => {
      $('pvCopy').textContent = 'Copied!';
      setTimeout(() => { $('pvCopy').textContent = 'Copy JSON'; }, 1200);
    });
  });

  function clearFilters() {
    state.q = ''; state.platform = 'all'; state.status = 'all'; state.flow = ''; state.app = '';
    $('search').value = '';
    $('flowSelect').value = ''; $('appSelect').value = '';
    renderChips(); render();
  }
  $('clearFilters').addEventListener('click', clearFilters);

  let t;
  $('search').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });

  renderChips();
  fillSelect($('flowSelect'), unique(screens.map(s => s.flow)), 'All flows', 'flow');
  fillSelect($('appSelect'), unique(screens.map(s => s.app)), 'All apps', 'app');
  render();
})();
