---
name: research-mockup
description: End-to-end research-to-mockup workflow for the current project: understand a feature's domain, concept, and outcomes; research real UX patterns on Mobbin; propose the UX; and build navigable HTML/CSS mockups that match the project's real design system — no Figma, fully offline. Use when the user asks to research a feature, redesign a screen or flow, create a mockup/prototype, or design UX. This skill is project-agnostic: it resolves the active project instance first and loads that project's context, so it never mixes apps.
---

# Research Mockup

## Objective

Build navigable HTML/CSS mockups of the current project's features that look like the
real app: same tokens, icons, illustrations, typography, and motion. Never use Figma.
Everything works offline by opening the studio with a double click (`file://`).

If the request is only "research/propose the UX" (no mockup mentioned), still deliver
research + findings + proposal, and continue to the mockup as the final deliverable —
unless the user explicitly asks to stop at the proposal.

## Step 0 — Resolve the active project (mandatory, before anything else)

This skill never bakes in an app. All project data lives in an *instance* folder created
by `setup.ps1`. Resolve the active instance at the start of every session:

1. Walk up from the current working directory looking for
   `instance/project-context.md`. If found, that folder is the active instance.
2. Otherwise read the registry at `~/.config/research-mockup/instances.json`, which maps
   each project name to its `instancePath` and `appRepoPath`. Match the current working
   directory (and its parents) against those paths.
3. If exactly one project matches, use it. If several match or none matches, ask the user
   which project they mean — or, if no instances exist at all, tell them to run
   `setup.ps1` in a cloned template and stop.

Then load, in this order:

1. `<instance>/instance/project-context.md` — identity, repos, design system,
   architecture map, surfaces, decision log.
2. `<instance>/instance/project-rules.md` — design constraints, frozen surfaces,
   navigation rules, copy rules, verification standards.
3. `<instance>/core/skills/ux-knowledge-base/references/INDEX.md`, then only the topic
   files relevant to the current task.

Below, `<instance>` means the resolved instance folder and `<app-repo>` means the
project's code repository, both taken from `project-context.md`. These files are kept
current by the workflow itself. Never ask the user to "read the repo" — the context is
already loaded here.

If the project adopted the repository's Design Foundation, those rules are already
rendered inside `instance/project-rules.md`; follow them unless the project overrides
them there.

## Greenfield vs existing app

Check `mode` in `project-context.md`:

- **Existing app:** steps 0-1 below read the real docs and code in `<app-repo>`.
- **Greenfield (app not built yet):** there is no code. Skip reading modules, i18n, and
  components. The concept brief plus the Design Foundation are the specification source,
  and the mockup is the blueprint. Handoffs list files to CREATE and a recommended
  starter structure instead of files to edit; `<app-repo>` is the planned location and
  may not exist yet.

## One session = one project

Sessions are opened in a specific folder (the instance folder or the app repository).
The context loaded above belongs to that folder's project. If the user wants to work on
a different app, start a new session in that app's folder — never mix two projects in one
session. If a task genuinely spans two apps, say so and finish one app's work before
switching.

## Research in one tool, implement in another

The instance folder is the shared memory between tools. You can do the research in
ChatGPT/Codex and the implementation in OpenCode (or the reverse): both resolve the same
instance from the same folder via Step 0, and nothing lives in chat memory. The concept
brief, findings, mockup, plan viewer, and handoff are files both tools read. One rule:
one tool writes at a time, and the handoff is the hand-over point.

## Recommended start phrase (copy / adapt)

> Use $research-mockup to research <feature>: first read the module docs and do
> domain/concept research on the web (objective, outcomes, competitors, must-have vs
> nice-to-have), then research the flows on Mobbin, propose the UX, and build the mockup
> in the studio; update the inspiration center and the project context.

## Mandatory flow (do not skip steps)

0. **Understand domain, concept, and outcomes (mandatory, BEFORE Mobbin).**
   - Read the module docs and code (step 1 items) AND research the concept on the web:
     what the feature must achieve, for whom, what problem it solves, direct and indirect
     competitors, category best practices, and must-have vs nice-to-have.
   - If the user asks to improve something without defining the objective (e.g. "something
     feels missing"), do not ask before researching: propose the outcome as a hypothesis
     with evidence and validate it with 1-3 questions at the end of the concept brief.
   - Deliver a **concept brief** (objective, outcomes, scope, non-goals, key decisions,
     web sources with URLs) BEFORE searching Mobbin; the Mobbin queries derive from the
     brief, not from the feature name. Save it to
     `<instance>/research/<feature>/concept-brief.md`.
   - Follow `<instance>/core/skills/research-mockup/references/domain-research-protocol.md`
     in this phase.

1. **Understand the domain (mandatory, complete).**
   - Read the project docs in `<app-repo>` and the module code: contracts, main views,
     and components.
   - **Map ALL surfaces of the feature:** search usages outside the module
     (`rg -l "<feature>" <app-repo>/src`), read the components that render its data
     (home, notifications, links, timeline, chat), and check i18n keys used by other
     modules.
   - Search docs and code with related vocabulary in every language the app uses; a
     single-language grep misses features.
   - Before declaring a gap, ask: **where does the user see this feature besides the main
     view?** If it already exists in another surface, the gap is one of consistency or
     discoverability, not absence.
   - **Document cross-references:** if a surface or feature lives outside the module
     folder and is not documented, document it as part of the deliverable. New docs are
     written in English (the project standard).

2. **Research on Mobbin** (via the `mobbin-ux-research` skill, official API):
   - Design >= 5 abstract queries: objective, structure, interaction, alternative domain,
     opposite pattern. In English; do not repeat the domain vocabulary in all of them.
     Queries derive from the concept brief.
   - Run:
     `node "<instance>/core/skills/mobbin-ux-research/scripts/mobbin-search.mjs"
     --query "..." --platform <platform> --limit 6-8 --out <dir>/metadata.json
     --download-dir <dir> --key-file "<instance>/instance/.env"`
     (8 per flow by default; 10-12 for complex flows such as wizards or check-ins).
   - Save under `<instance>/screens/<flow>/`, rename `NN - App.webp` with Node (never
     PowerShell `Get-Content`/`Set-Content`, which corrupts non-ASCII characters).
   - **Deduplicate:** run `node "<instance>/core/tools/dedupe-research.mjs"` after every
     download. It keys on the Mobbin screen id and creates hardlinks when a screen
     already exists in another flow (no duplicated bytes).
   - Analyze each capture with `npx --yes @liustack/modlens -i <img> -o <json>` and write
     `findings.md` per flow: pattern, why it works, limits, transferable or not,
     canonical links.
   - Respect Mobbin's terms: no mass scraping; never attribute findings to images you
     have not actually seen.

3. **Update the inspiration center.** The single center is the catalog at
   `<instance>/catalog/index.html`, regenerated with
   `node "<instance>/core/tools/build-catalog.mjs"` after every sync. The studio hub
   links to the catalog, and the catalog links back to the hub.

4. **Design the mockup** in `<instance>/mockups/<feature>/index.html`:
   - `<link rel="stylesheet" href="../assets/tokens.css">` and `../assets/base.css`.
   - Icons: `<i class="ph" data-icon="name"></i>` (embedded in `assets/icons.js`).
   - Illustrations: `<img data-illust="key">`; dark variant with
     `data-illust-light` / `data-illust-dark` (`assets/illustrations.js`).
   - Register the mockup in `assets/mockups.js`.
   - New assets: copy into `assets/`, update `core/tools/build-assets.mjs` if it applies,
     and run `node "<instance>/core/tools/build-assets.mjs"`.

5. **Verify before delivering:**
   - `node "<instance>/core/tools/check-mockups.mjs"` — 0 broken images, icons injected,
     no errors.
   - `node "<instance>/core/tools/shot-mockups.mjs"` — light/dark captures; visually
     review the key screens with modlens.

6. **Update project context.** After delivering, update
   `instance/project-context.md` (surfaces, decision log) and, if reusable evidence was
   produced, the `ux-knowledge-base` (date + source + tags).

## Design rules (summary)

- **No borders or shadows** on cards, chips, buttons, and surfaces: differentiate by
  surface color and spacing. Exceptions: inputs, 0.5px separators, focus ring, and a
  minimal shadow (`0 1px 4px rgba(0,0,0,0.08)`) only on FABs / bottom sheets.
- Typography by role using tokens (`--text-*`, `--leading-*`, `--font-*`,
  `--color-text-*`); at most 3-4 styles per view; sentence case by default (uppercase only
  for eyebrows < 12px with tracking >= 0.06em); at most 2 prominent weights; hierarchy by
  size/weight/color, not by capitals; tabular numbers; never `#000`.
- Motion: only transform/opacity; press `scale(0.97)`; sheets enter with spring and exit
  fast.
- One primary CTA per screen; cancel left / CTA right; sheet CTA sticky.
- Never `100vh`; respect safe areas and the mobile navigation height.
- **`instance/project-rules.md` wins over this summary wherever they differ.**

## References

- `references/mockup-studio-rules.md` — full design rules and Mobbin protocol.
- `references/domain-research-protocol.md` — concept brief and web research protocol.
- `references/implementation-verification.md` — post-implementation verification.

## Approved plan -> viewer + handoff (mandatory before implementing)

When the user approves a research + mockup:

1. Write the **reference map** in the handoff
   (`<app-repo>/docs/implementation/<feature>-handoff.md`): a table of
   component/decision -> local capture (path in `<instance>/screens/`) + canonical
   Mobbin URL -> what is taken from that capture (graphic, order, margins/gaps, layout,
   states, copy). Base it on `findings.md` and the modlens JSONs.
2. Create the **plan viewer**: `<instance>/mockups/plans/<id>/index.html`, half text /
   half references, navigable by phase (chips + previous/next), local images, Mobbin
   links, no fetch (file://). Each phase includes the fields `files` (exact paths to
   read/edit/create/delete, including i18n and stores), `commands` (exact npm/rg
   commands), and `checks` (verifiable criteria for that phase).
3. Register the plan in the hub ("Approved plans" section in `mockups/index.html` and
   `mockups/plans/index.html`).
4. The handoff must also include: the **Step -> Files -> Commands -> Acceptance check**
   table (one row per step, with exact i18n/store files and commands), the
   "Spec quality checklist" (see `ux-knowledge-base/references/spec-for-ai-agents.md`),
   and a note on cross-module surfaces if another module consumes the contracts being
   edited. For a greenfield app, the same table lists files to create (routes, views,
   stores, tokens) instead of files to edit, and the handoff doubles as the build spec.

## Frozen surfaces (do not modify)

Defined in `instance/project-rules.md`. If empty, nothing is frozen; document any new
freeze there during the handoff (Scope + Acceptance criteria) so implementers respect it.

## Implementation verification (mandatory)

When an approved plan moves to implementation (this workspace, OpenCode, or another
agent), the implementer must follow `references/implementation-verification.md` and, at
minimum:

1. **Walk the flow map of the handoff:** every tap, button, and CTA must lead exactly to
   the specified destination. Honor the hard navigation rules from
   `instance/project-rules.md`.
2. **Compare visually against the mockup** (not just "it works"): app captures in
   light/dark compared with the studio shots using modlens; fix layout, typography,
   weights, containers, and copy differences before delivering.
3. **Run the suite:** typecheck, lint of touched files, module tests, and the studio
   verification scripts (`check-mockups.mjs`, `shot-*.mjs`).
4. **Document deviations:** if the code contradicts the plan, the plan wins; document and
   continue; use `[NEEDS CLARIFICATION]` for a real gap.

## Mockup = guide, references = patterns (never implement literally)

- The navigable mockup is a **guide** for structure, flows, and states — not a
  pixel-perfect specification. Implementation must not copy it literally.
- Mobbin captures are **inspiration patterns**: take the best of each screen (order,
  chart type, interaction, period navigation, copy) and adapt it to the project's design
  system: tokens, icons, sentence case, surface rules. Never copy foreign colors, radii,
  fonts, or layouts as-is.
- The verifier compares the app against the mockup **for structure and states**, and
  against the references **for patterns**; the final result must read like the current
  project.
- A component repeated across views (e.g. a trend chart with range band) is implemented
  as one reusable token-based component, not duplicated code.
- Before adopting a new pattern, validate it against the references, the category
  standard, and the project's language; document the adaptation in the handoff.
