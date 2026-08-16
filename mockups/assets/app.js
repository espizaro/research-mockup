/* Research Mockup studio — shared interaction engine (icons, illustrations, navigation, sheets, steps). */
(function () {
  'use strict';

  // Embedded icons: <i class="ph" data-icon="arrow-left"></i>
  function injectIcons(scope) {
    (scope || document).querySelectorAll('[data-icon]').forEach(function (el) {
      const name = el.dataset.icon;
      if (window.ICONS && ICONS[name] && !el.dataset.injected) {
        el.innerHTML = ICONS[name];
        el.dataset.injected = '1';
      }
    });
  }

  // Embedded illustrations: <img data-illust="key"> or data-illust-light/dark
  function applyThemed() {
    const dark = document.documentElement.classList.contains('app-dark');
    document.querySelectorAll('[data-illust-light]').forEach(function (img) {
      const key = dark ? img.dataset.illustDark : img.dataset.illustLight;
      if (window.ILLUSTRATIONS && ILLUSTRATIONS[key]) img.src = ILLUSTRATIONS[key];
    });
  }
  document.querySelectorAll('[data-illust]').forEach(function (img) {
    if (window.ILLUSTRATIONS && ILLUSTRATIONS[img.dataset.illust]) {
      img.src = ILLUSTRATIONS[img.dataset.illust];
    }
  });

  // Theme: ?theme=dark on open, plus any [data-theme] button
  if (new URLSearchParams(location.search).get('theme') === 'dark') {
    document.documentElement.classList.add('app-dark');
  }
  document.querySelectorAll('[data-theme]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.documentElement.classList.toggle('app-dark');
      applyThemed();
    });
  });
  applyThemed();
  injectIcons();

  // Screen navigation
  function go(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('.web-screen').forEach(function (s) { s.classList.remove('active'); });
    const t = document.getElementById(id);
    if (t) { t.classList.add('active'); t.scrollTop = 0; }
    closeSheets();
  }
  document.querySelectorAll('[data-go]').forEach(function (b) {
    b.addEventListener('click', function () { go(b.dataset.go); });
  });

  // Bottom sheets
  function openSheet(id) {
    document.querySelectorAll('.sheet').forEach(function (s) { s.classList.remove('open'); });
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }
  function closeSheets() {
    document.querySelectorAll('.sheet').forEach(function (s) { s.classList.remove('open'); });
  }
  document.querySelectorAll('[data-sheet-open]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); openSheet(b.dataset.sheetOpen); });
  });
  document.querySelectorAll('[data-sheet-close]').forEach(function (b) {
    b.addEventListener('click', closeSheets);
  });

  // Chips / options
  document.querySelectorAll('[data-opt]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.classList.contains('chip')) {
        el.classList.toggle('sel');
      } else {
        const group = el.parentElement;
        group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('on'); });
        el.classList.add('on');
      }
      refreshSteps();
    });
  });

  // Chips that fill a textarea
  document.querySelectorAll('[data-fill]').forEach(function (b) {
    b.addEventListener('click', function () {
      const ta = document.querySelector(b.dataset.fillTarget || '#noteText');
      if (ta) ta.value = b.dataset.fill;
      document.querySelectorAll('[data-fill]').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      refreshSteps();
    });
  });
  document.querySelectorAll('textarea[data-required-for]').forEach(function (ta) {
    ta.addEventListener('input', refreshSteps);
  });

  // Range with value display and "same as before"
  document.querySelectorAll('input[type=range][data-range]').forEach(function (input) {
    const val = document.querySelector(input.dataset.rangeVal || '.scale-val');
    const update = function () {
      const v = input.value;
      if (val) val.textContent = v === '0' ? '–' : v;
      input.style.setProperty('--fill', input.min === '1' ? ((v - 1) / (input.max - 1)) * 100 + '%' : (v / input.max) * 100 + '%');
      refreshSteps();
    };
    input.addEventListener('input', update);
    update();
  });
  document.querySelectorAll('[data-same]').forEach(function (b) {
    b.addEventListener('click', function () {
      const input = document.querySelector(b.dataset.same);
      if (!input) return;
      input.value = b.dataset.sameValue || '7';
      input.dispatchEvent(new Event('input'));
      const val = document.querySelector('[data-range-val]');
      if (val) val.textContent = input.value;
    });
  });

  // Steps: a [data-steps] container with :scope > .step children
  function initSteps(container) {
    const steps = Array.prototype.slice.call(container.querySelectorAll(':scope > .step'));
    let index = 0;
    const cta = container.querySelector('[data-step-cta]');
    const dots = container.querySelector('[data-dots]');
    const bar = container.querySelector('[data-step-bar]');
    const title = container.querySelector('[data-step-title]');

    function ready(i) {
      const step = steps[i];
      if (!step) return false;
      if (step.dataset.optional === 'true') return true;
      const required = step.querySelectorAll('[data-opt].on, [data-opt].sel');
      if (required.length) return true;
      const range = step.querySelector('input[type=range][data-range]');
      if (range) return range.value !== '0' && range.value !== '';
      const ta = step.querySelector('textarea[data-required-for]');
      if (ta) return ta.value.trim().length >= 5;
      return true;
    }

    function render() {
      steps.forEach(function (s, i) { s.hidden = i !== index; });
      if (dots) {
        Array.prototype.forEach.call(dots.children, function (d, i) {
          d.className = i < index ? 'on' : (i === index ? 'on' : '');
        });
      }
      if (cta) {
        cta.disabled = !ready(index);
        if (index === steps.length - 2) cta.textContent = cta.dataset.saveLabel || 'Save';
        else if (index === steps.length - 1) cta.style.display = 'none';
        else cta.textContent = cta.dataset.nextLabel || 'Continue →';
      }
      if (bar) bar.style.display = index === steps.length - 1 ? 'none' : 'flex';
      if (title && container.dataset.day && container.dataset.days) {
        title.textContent = 'Day ' + container.dataset.day + ' of ' + container.dataset.days;
      }
      const screen = container.closest('.screen');
      if (screen) screen.scrollTo({ top: 0 });
    }

    function next() {
      if (!ready(index)) return;
      if (index === steps.length - 2) { index = steps.length - 1; render(); return; }
      if (index < steps.length - 1) { index += 1; render(); }
    }
    function prev() { if (index > 0) { index -= 1; render(); } }

    const nxt = container.querySelector('[data-step-next]');
    if (nxt) nxt.addEventListener('click', next);
    const prv = container.querySelectorAll('[data-step-prev]');
    Array.prototype.forEach.call(prv, function (b) { b.addEventListener('click', prev); });
    Array.prototype.forEach.call(container.querySelectorAll('[data-step-skip]'), function (b) {
      b.addEventListener('click', next);
    });
    container._steps = { next: next, prev: prev, render: render, go: function (i) { index = i; render(); } };
    render();
  }

  function refreshSteps() {
    document.querySelectorAll('[data-steps]').forEach(function (c) {
      if (c._steps) c._steps.render();
    });
  }

  document.querySelectorAll('[data-steps]').forEach(initSteps);
  refreshSteps();

  // Mini coverage calendar: paints N dots with the first "on" marked complete
  document.querySelectorAll('[data-minidots]').forEach(function (box) {
    const total = parseInt(box.dataset.minidots, 10) || 15;
    const done = parseInt(box.dataset.done || '0', 10);
    const today = parseInt(box.dataset.today || '0', 10);
    for (let i = 1; i <= total; i++) {
      const s = document.createElement('span');
      if (i <= done) s.className = 'on';
      if (i === today) s.className = 'today';
      box.appendChild(s);
    }
  });

  window.Mockup = { go: go, openSheet: openSheet, closeSheets: closeSheets, injectIcons: injectIcons };
})();
