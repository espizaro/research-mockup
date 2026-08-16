# Daily check-in / EMA

Sources: Apple State of Mind (iOS 17), JMIR 2024 factorial EMA experiment (e50275), "Logging on your worst day" (dev.to), Samsung Health One UI 7; Mobbin check-in flow (Liven, How We Feel, Bloom, Fitbit, Finch, Flo) (2026).

## Evidence

- **Apple State of Mind:** state first (valence slider with color), then adjectives, then cause categories + optional note. Distinguishes "right now" from "overall today"; configurable reminders.
- **JMIR factorial EMA (411 participants, 28 days, 32 conditions):** no significant main effects from question count (15 vs 25), EMA frequency (2 vs 4/day), schedule (fixed vs random) or scale type (slider vs Likert). What mattered: perceived usability (SUS 82.7) and liking the app; 1-3 minute check-ins are accepted.
- **Worst-day UX:** bad days are the most important to log and the most skipped. Friction hurts exactly when the user has the least energy; gaps create clinical bias.
- **Samsung Health One UI 7:** quick mood check-in + separate stress scale with 4 colors.
- **Mobbin:** the check-in lives on the home as a conditional card ("How do you feel right now?"); context (why) is separated from state; timestamps are implicit; summaries reinforce the habit.

## Design conclusions

1. **One daily entry vs moment logging.** If a product already logs specific moments (symptoms, signals), the home check-in should capture the DAY summary ("How was your day?"), not compete with moment logging.
2. **State first, context later.** One tap on a mood/state; optional dimensions (energy, sleep, stress); optional expandable note. Never block saving on a missing note.
   - Mood selector tiles: icon-first orb (~56px, Phosphor/illustrated icon) with background tinted by valence (12% idle → ~28% + scale 1.03 selected) and sentence-case label below; selection via stronger tint + semibold label, never borders/shadows. Sources: Mobbin mood-selector flow (Numo, Me+, Life Reset, Greg, Clue, Bloom, CREME), 2026-08-10.
3. **Question count is not the problem; perceived speed and pleasantness are.** Keep it to 1 tap minimum + optional fields.
4. **Design for the bad day:** big chips, no dragging, no mandatory keyboards, one primary CTA.
5. **Reminders, not streaks.** Configurable reminders work; punishing streaks cause abandonment.
6. Optional shortcut: "Same as yesterday" when a previous entry exists.

## Don't

- Tiny color dots as the only visual for mood options (flat, low affordance; upgrade to icon-first tinted orbs).
- 100+ emotion mood meters (niche, high friction).
- Long clinical symptom forms in a daily check-in (that belongs to moment/symptom logging).
- Multiple mandatory check-ins per day by default.
- Sliders without visible value or labels.