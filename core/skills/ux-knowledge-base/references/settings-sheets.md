# Settings sheets — rows, grouping and hierarchy

Sources: Mobbin `measurements/settings-sheet` (Moonlitt, Notion, Flighty, Too Good To Go, BFF,
Transit, 2026-08-11); internal `DocumentSettingsSheet.vue`; prior flows `measure-settings` and
`detail-actions`. Tags: settings, bottom sheet, configuration, list rows, hierarchy.

## When a settings sheet feels messy

- Multiple uppercase section labels that compete with the row labels.
- Rows with long paragraphs (3+ lines) or duplicated titles/subtitles.
- A footer button ("Listo") that adds nothing when X/backdrop already closes the sheet.
- Inconsistent leading icons (some rows have them, some do not) or rainbow colors per row.

## Pattern: rows as cards

- Group settings into **surface cards** separated by `--space-3` (or a single card for a tight
  related group like PDF/CSV). Cards give air without needing section headings.
- Each row: leading icon chip (40px, `--color-primary-soft` + `--color-primary` for actionable
  rows; `--color-bg-sunken` + `--color-text-secondary` for secondary groups), semibold label
  (`--text-base`), one-line secondary meta (`--text-sm`), chevron or badge on the right.
- Header: centered title, X (or back) via `MobileHeaderAction`; no duplicated subtitle below the
  title (the title already says "Configurar · Presión arterial").
- Color is semantic and sparse: primary for actions, neutral for informational rows, error only
  for destructive actions. Never one accent color per row without a reason.
- Badges ("Próximamente") use `--color-bg-sunken` + `--color-text-tertiary`, caption size.

## Application decision (2026-08-11)

- `MeasurementDetailSettingsSheet` was redesigned to this pattern: Recordatorios, Exportar
  (grouped PDF/CSV), Rango personal, Fuente de datos, Unidad. Props/emits unchanged.
- Source of truth: `src/modules/measurements/components/settings/MeasurementDetailSettingsSheet.vue`
  and `outputs/mockups/research/measurements/settings-sheet/hallazgos.md`.
