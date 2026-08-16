# Health measurement data views — hub, detail, history, calendar

Sources: Mobbin flows `measurements/hub-overview`, `metric-detail`, `calendar-browse`,
`period-comparison`, `history-list`, `voice-entry` (48 screens analyzed 2026-08-11); web: NHLBI,
AHA, Apple Health, Samsung Health, Oura, Health Connect UI guidelines, NN/g data tables, Data
Visualisation Catalogue. Tags: measurements, vitals, dashboard, chart, range band, calendar
heatmap, history rows, period summary, data viz.

## When a list of cards is right, and when it is not

- Cards win for the **resume/glance** task (few metrics, "how am I?") when each card carries
  value hero + status + source + relative time. Oura, Bevel, Withings and Google Fit all use
  vertical cards without borders, differentiated by background.
- Cards lose for the **comparison** task: comparing two values across cards forces spatial
  reorientation (NN/g). History of dated records belongs in **aligned rows grouped by day**
  (Apple Health, Klima, Toggl Track).
- A dedicated module's hub may be a list of cards; the record history inside it is a list of
  rows. Do not use the same component for both tasks.

## Metric detail is chart-first

- Order: hero value + unit, one-line interpretation ("within your normal range"), segmented
  period selector **Week/Month/Quarter/Year with prev/next navigation** (Withings pattern,
  e.g. "This Month"), chart with personal range band, 3 stats (average, range, records),
  period summary with distribution, recent records.
- Interpretation must be **text + color**, never color alone (Superpower, Bevel; clinical
  accessibility rule).
- For paired metrics (blood pressure), render two series (systolic/diastolic) with a legend;
  the "worst state wins" for the status badge.
- Period deltas (3/7/14/30/90 days, Bevel) answer "did it change?" in one glance; keep them as
  secondary support, not the hero.
- Ranges are value limits from the active profile; the date window is the period selector.
  Never conflate them (see measurement-ranges.md).
- The trend chart is a **reusable token-based component** (series + band + period in, SVG out),
  never duplicated markup per metric; colors/band/axis come from the product's tokens, not from
  the reference app's palette.
- When switching period, keep the last loaded chart and records visible while the new fetch runs
  (**stale-while-revalidate**): swap to skeletons/empty only when the fetch actually finishes, or
  when there is nothing to show yet. Replacing content with skeletons on every range change reads
 as a full reload/flash and breaks the sense of continuity (validated fix, 2026-08-11).
- Custom-header detail views that opt out of the shell safe area (`safeAreaMode: 'view'`) must add
  `padding-top: var(--safe-area-top, env(safe-area-inset-top, 0px))` to their sticky header;
 otherwise the header slides under the Android status bar (validated fix, 2026-08-11).

## Temporal exploration

- A month **calendar heatmap** with cells colored by day state scales to 6m/1y and makes gaps
  and streaks visible (Google Fit, Bevel, Brick, Ultrahuman).
- Tap a cell to open the day detail (values, context, note) — the calendar is navigation, not
  the destination (Clue pattern).
- Always include a legend with text labels; never color alone.

## Period summary and comparison

- Monthly summaries work as trend chart + 3-4 stat tiles (adidas Running, The Outsiders).
- Compare against the user's own previous period or personal range, never population averages
  (Commons pattern is wrong for clinical data).
- Distribution bars of the period (in range / review / attention) are high-signal for
  professionals and patients; the repo may already compute classification by range.

## Voice entry for clinical data

- Mic states must be visible with text (idle/listening/parsing), never icon-only.
- Voice flow is capture → parse → review → confirm; low-confidence parses warn ("review the
  values") and never auto-save (Wispr Flow check, Fabric stop+transcript, Manus transcribing).

## Application decision (2026-08-11)

- Measurements hub keeps cards enriched with sparkline + status + source + relative date.
- Detail becomes chart-first with a segmented Week/Month/Quarter/Year selector + prev/next
  navigation (Withings), dual series for BP and distribution summary; the chart is a reusable
  component (MeasurementTrendChart) with tokens.
- History becomes aligned rows grouped by day; calendar heatmap is the temporal explorer.
- Register keeps the repo's full-screen 2-step form with voice review and "use last" shortcut.
- The mockup is a guide, not a literal spec: references are patterns adapted to the
project tokens (rule from the research-mockup SKILL.md).
- Sources: `outputs/mockups/research/measurements/` and handoff
  `docs/implementation/measurements-handoff.md` in myhealthshare.
