# Visual style — surfaces, borders, shadows, motion, layout

Sources: Material 3 Expressive Motion, the Design Foundation tokens; validated against Mobbin references (2026).

## Surfaces without borders or shadows

- Cards, chips, options, buttons and surfaces differentiate by **background** (`sunken`, `surface-muted`, `primary-soft`, accent tints) and **spacing**, not by borders or shadows.
- Allowed exceptions:
  - Inputs/textareas: border from `--color-input-border` (or equivalent).
  - Row separators: 0.5px divider.
  - Focus ring.
  - Minimal shadow `0 1px 4px rgba(0,0,0,0.08)` only on FABs and bottom sheets.
- Prohibited: box-shadow on primary buttons, cards, nav, thumbnails.

## Motion (M3 Expressive)

- Animate only `transform` and `opacity`; never layout properties or backdrop-filter.
- Press feedback: `scale(0.97)`, entry 80ms linear, exit with spring.
- Bottom sheets: enter with rebound spring, exit fast with ease-out.
- UI micro-interactions < 300ms; stagger 30-80ms.
- Respect `prefers-reduced-motion`.
- Do not animate keyboard-triggered actions.

## Layout and navigation

- Never use `100vh`; use the app height token and respect safe areas and bottom-nav height.
- One primary CTA per screen. Cancel left, primary right. Sheet CTA is sticky.
- Destructive confirmations live inside the sheet (no nested modals).
- Sticky headers use a background fade; scroll content under them.
