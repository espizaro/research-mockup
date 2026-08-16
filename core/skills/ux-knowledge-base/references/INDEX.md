# UX Knowledge Base â€” Index

Single source of reusable UX/UI evidence. Read this file first; load only the files that match the task.

## How to use

1. Find the topic in the table below.
2. Open that file and apply its patterns and decisions.
3. After a research cycle, update the base (see Contribution rules).

## Files

| File | Contains | Read when |
|---|---|---|
| `typography.md` | Type roles, sentence case, weights, tracking, line-height, tabular numerals | Designing text hierarchy, labels, buttons, numbers |
| `visual-style.md` | Surface differentiation, borders/shadows exceptions, M3 motion, layout and safe areas, CTA rules | Styling cards, sheets, buttons, motion |
| `empty-states.md` | NN/g and healthcare empty-state rules; home vs dedicated views | First-run, empty lists, no-data views, loading |
| `daily-check-in.md` | Mood/EMA evidence (Apple, JMIR, worst-day UX, Samsung); mood-first design | Wellness check-ins, daily logging, symptom vs daily state |
| `today-dashboard.md` | "Home = Today" pattern; conditional actions, metrics, first-run | Dashboards, home screens, actionable lists |
| `notifications-center.md` | Notification inbox patterns: time groups, pills, mark-all, row actions, unread cues | Designing notification centers or lists |
| `measurement-ranges.md` | Range presets vs custom ranges; status badges driven by active profile | Designing measurement settings, ranges, status pills |
| `longitudinal-tracking.md` | Closed-report structure (key numbers + findings), active "mission of the day", contextual home card vs record FAB, details in sheets | Longitudinal logs, traces, final reports, daily check-in surfaces, habit/activity tracking |
| `data-visualization.md` | Health measurement data views: cards vs rows, chart-first detail with range band, calendar heatmap, period summary/deltas, voice entry states | Designing vitals/metrics hubs, details, histories, calendars, dashboards |
| `settings-sheets.md` | Settings bottom sheets: rows as cards, icon chips, semantic color, hierarchy without uppercase eyebrows or long paragraphs | Redesigning any settings/configuration sheet or panel |
| `ux-research.md` | Mobbin search protocol, web research, evidence hierarchy, inspiration center | Starting any UX research cycle |
| `mockup-prototyping.md` | HTML/CSS navigable mockups, token systems, verification, hub | Building clickable prototypes without Figma |
| `implementation-handoff.md` | Handoff document template and rules | Passing research + mockup to an implementer |
| `spec-for-ai-agents.md` | Plan quality for AI implementers: six spec areas, gated phases, exact files/commands/checks, `[NEEDS CLARIFICATION]` protocol | Writing or reviewing handoffs/plans before implementation |
| `opencode-bridge.md` | AGENTS.md snippet, `opencode run`, session export | Continuing implementation in OpenCode |

## Update log

- 2026-08-11 — Settings sheets: new `settings-sheets.md` (rows as cards, icon chips, semantic
  color, no uppercase eyebrows/long paragraphs/footer redundancy). Applied to the measurements
  metric settings sheet. Sources: Mobbin `settings-sheet` (Moonlitt, Notion, Flighty, TGTG,
  BFF, Transit) + internal `DocumentSettingsSheet.vue`.

- 2026-08-11 — Measurements (sub-módulo métricas): new `data-visualization.md` with cards-vs-rows
  decision, chart-first detail with dual series (BP), calendar heatmap as temporal explorer,
  period summary/deltas vs own previous period (not population), and voice entry review states.
  Sources: Mobbin `measurements/*` (hub-overview, metric-detail, calendar-browse,
  period-comparison, history-list, voice-entry), NHLBI, AHA, Apple Health, Samsung Health, Oura,
  Health Connect UI guidelines, NN/g, DataViz Catalogue.

- 2026-08-10 — Traces v2 (longitudinal): new `longitudinal-tracking.md` with the structured
  closed-report pattern (headline + quality badge + key numbers + findings + details in
  sheets), the active "mission of the day" pattern, and the contextual Home card vs record
  FAB decision. Sources: Mobbin `traces-v2/*` flows (closure-report, checkin, detail-sections,
  trend-preview, history, home-action), JMIR, RxD, shared decision-making study, StudyTrax,
  Runna Revyl Atlas.

- 2026-08-09 — Iteration 4 (Home/Medidas/Bienestar/Notificaciones): new
  `notifications-center.md` (time groups, pills, mark-all with confirmation, row actions,
  quiet unread) and `measurement-ranges.md` (ranges = value limits per metric; presets from
  guidelines + custom; badges from active profile). Sources: Mobbin flows
  notifications-center / notifications-actions / range-presets / range-custom, Courier,
  Boundless, Health2Sync.

- 2026-08-09 — Iteration 4 implementation validation: URL-driven sheets reused the existing
  shared `sheet`/`panel` route-key exclusions; measurement settings now use `panel=devices`
  and `panel=ranges` without duplicating the Ranges manager. Project-specific deviation:
  Health Connect behavior remains delegated to the existing embedded integration panel.

- 2026-08-08 — Plan integral: new `spec-for-ai-agents.md` (Addy Osmani, GitHub Spec Kit,
  Vercel evals, tworkflow, CRISPY); handoffs now require per-step file/command/check
  tables; the plan viewer renders files/commands/checks per phase.

- 2026-08-08 (iter 3) — Measurements: header-gear module settings (visibility toggles, hide != stop collecting), per-metric settings sheet (reminders/export/range/source), full-screen 2-step entry with voice review, real sources only (sources: Mobbin measure-settings / detail-actions / voice-entry / data-sources / entry-review; M3; clinical dictation).

- 2026-08-08 — Home + Measurements refinement: one thing/one place actions rule,
  hub→detail for metric modules, FAB + AI bubble consistency, Health Connect education-first
  (sources: Mobbin health-metrics-dashboard / measurement-detail / health-devices-sync /
  health-quick-add, Apple Health BP, Google Health Connect guidelines, ROOK, Welkin/Decoda).

- 2026-08-06 — Seed with findings from the initial Home dashboard investigation: typography rules, visual style, empty states (NN/g + Koru), daily check-in (Apple State of Mind, JMIR EMA, worst-day UX, Samsung), today-dashboard (Mobbin 6 flows), Mobbin research protocol, mockup studio workflow, and the OpenCode bridge.

## Contribution rules

- Write in English. Keep every file standalone: a reader loads only one topic.
- Add date, source(s), and tags to each update.
- If a new topic appears, create a new file and add it to this table.
- If a decision is project-specific, say so and record the deviation; do not generalize without evidence.
