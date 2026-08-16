# Typography — premium hierarchy

Sources: Apple HIG Typography, Material 3 Type Scale, Carbon Design System, BlackRock sentence-case guidance, Butterick Practical Typography; applied in the Design Foundation (2026).

## Core rules

1. **Choose the ROLE first**: Display / Headline / Title L-M-S / Body L-M / Label / Caption / Eyebrow. Size, weight and color derive from the role; never invent ad-hoc styles.
2. **Sentence case by default.** Titles, buttons, labels, rows and chips start with a capital and continue lowercase. Uppercase is reserved for eyebrows < 12px with letter-spacing ≥ 0.06em.
3. **Max 3-4 type styles per view** (weight × size × color). Hierarchy comes from size + weight + color, not from shouting. If everything is bold, nothing stands out.
4. **Max 2 prominent weights per view.** Semibold/Bold for titles and key figures; Medium for labels/values; Regular for body. Extrabold only for numeric displays or a single hero.
5. **Tracking (Inter):** Display/Headline ≥ 28px → -0.02/-0.03em; Title 18-24px → -0.01/-0.02em; Body 14-16px → 0; Caption → 0/+0.01em; uppercase < 12px → ≥ 0.06em.
6. **Line-height:** titles 1.15-1.3 (never 1 or auto for large titles); body 1.5-1.625; caption ~1.375.
7. **Numbers:** clinical/measurement values use tabular numerals (`font-variant-numeric: tabular-nums`).
8. **Color hierarchy:** primary for main content, secondary for meta/labels/support, tertiary for hints. Never pure black (#000).
9. Do not justify text on mobile; do not use italics as emphasis.

## Why it works

- Contrast by size/weight/color reads faster than uppercase shouting.
- Space separates sections better than rules or all-caps labels.
- Sentence-case CTAs feel modern and are read faster.
- Consistency of roles makes an interface feel like a system.

## Checklist before shipping a view

- Any title/button/label in uppercase that is not an eyebrow? Fix.
- More than 3-4 styles? Reduce.
- Bold everywhere? Reduce to 2 prominent weights.
- line-height 1 or auto on a large title? Fix.
- Pure black text? Fix.
- Clinical numbers not tabular? Fix.
