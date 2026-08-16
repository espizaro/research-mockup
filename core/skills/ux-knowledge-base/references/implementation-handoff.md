# Implementation handoff — template and rules

Purpose: turn research + mockup into a document an implementer (OpenCode, another agent, a developer) can execute without re-doing the investigation.

## Rules

1. Create the handoff **inside the target repo** (e.g. `docs/implementation/<module>-handoff.md`) so it travels with the code.
2. Write it in the repo's documentation language (this project: English).
3. Every decision must cite its rationale and source (Mobbin flow, web source, product constraint).
4. Reference the mockup and research paths; the implementer should open them.
5. Keep acceptance criteria checkable ("the home hides zones without data", "5 tabs, no More button").
6. If the product has a verification script (mockup check, lint, tests), list it.
7. For approved plans, add the **step-by-step file map** (see "Plan integral" below):
   exact files (read/edit/create/delete), exact commands and an acceptance check per step.

## Template

```markdown
# <Module> — Implementation handoff

Status: ready to implement | date: <YYYY-MM-DD>
Mockup: <path to mockups/<module>/index.html>
Research: <path to research/<module>/>

## Objective
<What this module does for the user, in one or two sentences.>

## Scope
- In scope: <screens/flows/behaviors to build>
- Out of scope: <explicitly excluded, e.g. legacy cleanup, future metrics>

## Decisions
| # | Decision | Rationale | Evidence |
|---|----------|-----------|----------|
| 1 | <decision> | <why> | <source / Mobbin flow / web link> |

## Flows and screens
- <Screen/Sheet 1>: purpose, elements, interactions, states (loading, empty, filled, error, success).
- <Screen/Sheet 2>: ...

## Design rules to apply
- Read the knowledge base `references/INDEX.md` in the research instance, then the relevant files (typography.md, visual-style.md, empty-states.md, ...).
- <product-specific tokens/constraints>

## Data model / contracts
- Fields to add or change, migrations, i18n keys, API/store notes.

## Acceptance criteria
- [ ] <checkable criterion>
- [ ] <checkable criterion>

## Verification
- <commands/checks the implementer must run>

## Follow-ups (optional)
- <legacy cleanup, later iterations>
```

## OpenCode note

At the top of the file, add: "Read this file first, then consult the UX knowledge base INDEX before implementing. Ask before deviating from decisions."

## Reference map (required for vision-capable implementers)

When the plan is approved, add a **reference map** table so a vision model can implement
each component from the mockup + the exact screens that inspired it + the design rules.

- Every row maps one component/decision to the reference screens that inspired it and the
  specific thing to copy (chart type, card order, margins/gaps, horizontal layout, mic states,
  copy tone, etc.).
- Local image paths must be relative to the Mockup Studio so the model can open them with the
  mockup (e.g. `outputs/mockups/research/home-dashboard/detail-actions/02 - Fitbit.webp`).
- Include the canonical Mobbin URL for cross-checking.
- Also create the **plan viewer**: `outputs/mockups/plans/<id>/index.html` (half text / half
  references, navigable by phases) and register it in the hub section "Planes aprobados".

| Component / decision | Reference (local + canonical) | What to take from it |
|---|---|---|
| <e.g. Hub settings toggles> | <local path> ? <mobbin URL> | <toggles + explanatory copy + Cancel/Save> |

## Frozen surfaces

List any UI that must NOT change (e.g. AIChatBubble, Medications UI) at the top of the
handoff, in Scope, and again in Acceptance criteria so implementers never touch them.

## Plan integral (required for approved plans)

Before an approved plan goes to implementation, the handoff must include all of the
following. See `spec-for-ai-agents.md` for the research and the full checklist.

### Step-by-step file map

Add a table after "Implementation order" with one row per step:

| Step | Files to read | Files to edit / create | Delete | Commands | Acceptance check |
|---|---|---|---|---|---|
| 0 · Baseline | docs + INDEX + router files | — | — | `npm run typecheck`, `npm run lint`, `npm run test:run` | Green baseline recorded |
| 1 · <change> | exact read paths | exact edit/create paths | exact delete paths | exact commands + `rg` probes | testable result |

- Name i18n files (module `i18n/en.json` + `es.json`) and stores per step when they are
  touched; never say "add i18n keys" without naming the files.
- Add a cross-surface guard note when other modules consume the contracts you will edit
  (for example Medical Links imports `MEASUREMENT_CONFIGS`).

### Spec quality checklist

Add a short checklist section to the handoff stating that:

- commands are exact per step,
- boundaries are explicit (frozen surfaces, never-delete files, edit-only files),
- tasks are small and gated (run the step commands before moving on),
- acceptance criteria are testable per step,
- the implementer verifies plan premises against the code before editing,
- the plan wins over the code (document conflicts and continue),
- real gaps stop the task with `[NEEDS CLARIFICATION]`,
- context loading order is stated (plan viewer → handoff → INDEX → AGENTS.md).

### Plan viewer

The approved plan viewer (`outputs/mockups/plans/<id>/index.html`) must render, per phase:
text, reference images, and the `files` / `commands` / `checks` fields so a vision-capable
implementer can open one file and follow it end to end.
