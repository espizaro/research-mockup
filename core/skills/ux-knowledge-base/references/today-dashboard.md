# Today dashboard / home

Sources: Mobbin flows daily-overview (Oura, Withings, Google Fit, Visible, Bevel), actionable-today (Asana, Reminders, Numo, Tiimo, timespent), patient-portal (Zocdoc, Hers, Hims, CVS, Apple Health), personalization (Notion, Opal, Me+), first-run (Runna, Starling, timespent); web: Apple Health Summary, MyChart, WHOOP, Samsung Health (2026).

## Core pattern: "Home = Today"

- The home is a dashboard of the day, not a gallery of modules.
- Everything "today" appears conditionally; history, management and configuration live in dedicated tabs/views.

## Zones (top to bottom, all conditional)

1. Header: greeting + long date + notifications (and access to settings/help).
2. Week strip or date anchor so the user can browse past/future days.
3. One-line day summary in natural language ("Here's your day: 2 intakes pending and your check-in is waiting").
4. **Actions of the day (1-3 items):** pending intakes with progress, active question from a trace, upcoming appointment, pending check-in, low stock. Each resolves in one tap; the zone disappears when there is nothing pending.
5. **Wellbeing check-in card:** prompt if missing, compact editable summary if present (see daily-check-in.md).
6. **Metrics with data only:** show sections with recent data; hide empty sections (see empty-states.md). Keep one rich/immersive section if the product has one; route the rest to a simple "Measures" destination.
7. Optional: AI insight card (only when there is something worth saying); emergency/SOS per product rules.

## Rules

- Glanceability: in 3-5 seconds the user knows how the day is going.
- Time context everywhere: "today", "2h ago", "no data today".
- CTA next to the data, not in a menu.
- Personalize by usage, not by onboarding setup (no health-focus chips at signup).
- New user: one single welcome card with the first action; no empty cards (see empty-states.md).

## Don't

- 6+ metric cards at once.
- Unexplained scores/rings.
- Duplicate features that already live in other tabs (e.g. full medication history in home).
- Home as a quick-register form for everything.