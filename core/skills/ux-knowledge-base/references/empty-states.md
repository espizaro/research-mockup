# Empty states

Sources: NN/g "Empty states in interface design"; Koru UX "Healthcare empty states" (2026).

## NN/g — three rules

1. **Communicate system state.** Never a totally blank screen; the empty state explains that there is nothing yet and why.
2. **Provide a learning cue in context.** Example: "Star your favorites to list them here."
3. **Give a direct pathway** to the key action with a single button.
- Never show an empty state while loading.

## Healthcare additions (Koru)

- Use clear clinical wording, not "No data": e.g. "No active orders" instead of "Nothing to show".
- Components: visual, header, explanation of context + next step, and one CTA.
- Patterns that matter:
  - **New patient:** the emptiness is expected; reassure and start with one action.
  - **Workflow completion:** empty = success, not an error (e.g. "All caught up").
  - Search with no results, access control, and processing have their own copy.

## Application decision (validated in a health Home project)

- **Home/dashboard:** hide zones without data when their configuration does not depend on an immediate action. A new user sees ONE welcome card with the first concrete action (check-in or first record). Zones with pending tasks are shown because the "empty" is a task, not missing content.
- **Dedicated views** (lists, history, traces): show a formal empty state: illustration + clear header + context + single CTA.
- Temporal gaps inside a populated history are a one-line message ("No intakes this day"), not a full empty state.
- **Exception — sole entry point (2026-08-09):** if a hidden zone is the ONLY way to reach a
  module (no tab/nav item), it must not disappear. Home shows a compact empty card with a
  single CTA, or the new-user welcome card covers the first action; the module's dedicated
view still gets the formal empty state. Source: Home implementation gap (Measurements has
  no bottom-nav tab, so hiding the empty zone removed all access).
