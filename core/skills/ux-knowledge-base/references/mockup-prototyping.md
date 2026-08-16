# Navigable mockups without Figma (HTML/CSS)

Pattern validated in the Research Mockup studio (2026): high-fidelity, clickable prototypes with real design tokens, no server, no Figma.

## Structure

- A **hub/index** page lists every mockup; each mockup is a self-contained `index.html`.
- Everything must work over `file://` with a double click: no `fetch`, no CORS, no build step.
- Shared assets per project: `tokens.css` (exact copy of the product's design tokens), `base.css` (components built only from semantic tokens), `icons.js` / `illustrations.js` (embedded SVG/data URLs), `app.js` (screen/sheet/step engine).
- Icons: `<i class="ph" data-icon="name">` injected by the engine. Illustrations: `<img data-illust="key">` with light/dark variants when needed.

## Rules

1. **Tokens only.** Never hardcode colors, radii, spacing, type sizes or weights. Use semantic tokens (`--color-*`, `--radius-*`, `--space-*`, `--text-*`, `--shadow-*`).
2. **Design rules apply** (see typography.md and visual-style.md): sentence case, max 3-4 type styles, no borders/shadows on cards, M3 motion, one primary CTA.
3. **Phone frame** (e.g. 390×844) with status bar, screens, bottom sheets, and a side proto-nav for QA navigation.
4. **States over screens:** show day-with-actions, day-complete, new user, empty states, success states, error states — not just the happy path.
5. **Register every mockup** in the hub list.

## Verification (mandatory before delivery)

1. Headless browser check: 0 broken images, all icons injected, all illustrations loaded, no console errors (light + dark).
2. Screenshot generator: capture every screen and key sheet in light + dark.
3. Vision review of key screenshots (modlens or native vision) before calling it done.
4. Sync a copy to the user's offline inspiration folder (`mockups\` in this repo) and regenerate the catalog when captures change.

## Why it works

- Real tokens → the mockup looks like the product and survives theme changes.
- No server → works anywhere, easy to share.
- The hub becomes an offline inspiration center that every investigation feeds.
