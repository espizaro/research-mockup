# Design Foundation

An opinionated, production-grade design system for mobile and PWA products. When a project
adopts it (setup choice: "let the repository own the design system"), this document is
rendered into `instance/project-rules.md` and paired with the starter token set in
`core/studio/starter-tokens.css` and the studio components. It distills current
industry practice so you never re-configure the same decisions for each new app.

`instance/project-rules.md` always wins where it differs — this is the default, not a
straitjacket.

## 1. Color and surfaces

- Components use **semantic tokens only** (`--color-bg`, `--color-surface`,
  `--color-primary`, `--color-text-*`, ...). Never raw hex, never primitives, never
  `#000` or `#fff` in a component.
- Surface hierarchy is expressed with **tone, not borders or shadows**: `bg`, `bg-sunken`,
  `surface`, `surface-muted`, `primary-soft`. Cards, chips, buttons and sheets have no
  border and no shadow by default.
- Exceptions: inputs/textareas keep a visible outline, 0.5px separators between groups,
  a visible focus ring, and a minimal elevation shadow (`0 1px 4px rgba(0,0,0,0.08)`)
  only on FABs and bottom sheets.
- Contrast meets **WCAG 2.2 AA**: 4.5:1 for body text, 3:1 for large text and UI
  components, plus a visible focus indicator (never `outline: none` without a
  replacement).
- Light and dark are both first-class. Dark is not "light inverted": re-tune surface
  steps and text colors, and honor `prefers-color-scheme` plus a manual toggle.

## 2. Typography

- A **role-based scale**, not a font-size grab bag: display, title, headline, body,
  label, eyebrow. Sizes use `clamp()` so web/PWA layouts scale fluidly.
- **Sentence case everywhere** by default. Uppercase only for eyebrows under 12px with
  letter-spacing >= 0.06em.
- At most 3-4 type styles per view and at most 2 prominent weights. Hierarchy comes from
  size, weight and color — not from all-caps or excessive bold.
- Numbers that change or compare use `font-variant-numeric: tabular-nums`.
- Line heights are tuned per role (display ~1.1, body ~1.45); text never truncates in a
  way that hides meaning (use full text + ellipsis only on non-critical metadata).
- One font family for UI (system stack by default) and, if the brand has one, a display
  face used sparingly.

## 3. Spacing, layout and safe areas

- A 4px base grid exposed as space tokens (`--space-1` ... `--space-12`); spacing in a
  component is always one of the tokens, never an ad-hoc value.
- Respect **safe areas** on all edges (notch, home indicator) and reserve
  `--mobile-nav-height` for bottom navigation. Never use `100vh` (it breaks with
  mobile browser chrome); use `100dvh` or a min-height layout instead.
- On web/PWA, cap readable content width and keep primary actions reachable by thumb on
  mobile (bottom-anchored primary actions).
- Tap targets are at least **44x44px** (48px where comfortable); adjacent interactive
  elements have adequate separation.

## 4. Shape and elevation

- Radius is tokenized by component class (`--radius-sm/md/lg/full`); large sheets and
  cards share the same language so the app reads as one system.
- Elevation is communicated by surface tone; shadows are reserved for the exceptions in
  section 1. No gradient-heavy "3D" surfaces, no arbitrary border styles.

## 5. Motion (M3 Expressive)

- Animate only `transform` and `opacity`; never `width/height/top/left` in the main
  path. Easing tokens follow M3 Expressive: standard, emphasized, and decelerate/accelerate
  curves.
- Press feedback: `scale(0.97)` with a fast standard ease.
- Bottom sheets enter with a spring and exit fast; durations stay in the 150-400ms range.
  Content transitions (fade/scale) should feel weightless, not decorative.
- Respect `prefers-reduced-motion`: replace motion with simple fades and no distance.
- Motion communicates state (where content came from, where it goes); it never exists
  just to look animated.

## 6. Components and patterns

- **One primary CTA per screen.** Cancel goes left, the primary action goes right; in a
  bottom sheet the CTA is sticky in the footer and confirmations happen inside the sheet.
- **Bottom sheets** for lightweight tasks and confirmations; full screens for complex
  flows. Sheets close on X, back gesture, or tapping the scrim; destructive actions are
  visually separated from safe ones.
- Every screen ships its states: happy path, empty, loading, error, success, and
  new-user — in light and dark.
- Empty states explain the value, not just "nothing here" (what this is, why it matters,
  one action to start). Errors say what happened and how to fix it, never a raw code.
- Loading uses skeletons that mirror the final layout; avoid spinners as the default
  everywhere.
- Data-heavy screens use progressive disclosure: summary first, detail on demand.

## 7. Iconography

- One icon set per project (stroke-based, 24px grid, consistent 1.5-2px weight).
- Icons are decorative when a text label exists; otherwise they carry an accessible name.
- Icon + label pairs keep meaning consistent across the app (the same icon never means
  two different things).

## 8. Copywriting

- **Sentence case**, action-first verbs, no jargon. Buttons are verb + object
  ("Add medication", "Share report") — never "click here", never "OK" without context.
- A **terminology table** (in `instance/project-context.md`) pins the approved name for
  every feature, button and state; the UI reuses it everywhere.
- Numbers, dates and units follow locale conventions; clinical/technical values keep
  tabular numerals and never drop precision silently.
- Confirmation copy names what will happen and what can be undone.
- All copy is written for internationalization from day one (no concatenated sentences,
  no hardcoded gender/case assumptions).

## 9. Accessibility and the quality bar

- WCAG 2.2 AA is the floor, not the goal: contrast, focus, keyboard navigation, screen
  reader labels, reduced motion, and no information conveyed by color alone.
- Components render correctly at 200% zoom and with larger system font sizes.
- Performance: no layout thrash, images sized properly, interactions respond within
  100ms, and animations stay on the compositor.

## 10. Adoption and override

- Setup renders this document into `instance/project-rules.md`, copies
  `core/studio/starter-tokens.css` into `mockups/assets/tokens.css`, and the studio
  components already implement these rules.
- Overriding is normal: edit `instance/project-rules.md` when the product needs a
  different decision, and record why in the decision log.
