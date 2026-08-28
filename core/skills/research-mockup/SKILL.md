---
name: research-mockup
description: End-to-end research-to-mockup workflow for the current project: understand a feature's domain, concept, and outcomes; research real UX patterns on Mobbin; propose the UX; build a navigable HTML/CSS mockup with the project's real design tokens, capturing local PNG references; and deliver an offline plan viewer (screenshots + findings + steps) plus a handoff so any AI implementer (OpenCode, DeepSeek, Command Code, Codex) can implement it offline. Optionally, after user approval, bridge to Figma via the companion skill $mockup-to-figma. Use when the user asks to research a feature, redesign a screen or flow, create a mockup/prototype, or design UX. This skill is project-agnostic: it resolves the active project instance first and loads that project's context, so it never mixes apps.
---

# Research Mockup

## Objective

Build navigable mockups of the current project's features that look like the real app:
same tokens, icons, illustrations, typography, and motion. **The visual layer is built in
the navigable HTML/CSS studio (offline, `file://`) by default** — same engine, tokens,
light/dark, no server. After building, **capture light/dark PNGs** and **deliver a plan
viewer that shows, per phase, the local reference screenshots (Mobbin and others) side by
side with the text** — files, commands, checks. The plan viewer + exported captures +
machine-readable `reference.json` are what any offline implementer reads, so the workflow
never depends on Figma or on the implementer having vision access.

Figma is an **optional final step**, not the build path: once the user approves the plan,
offer `$mockup-to-figma` (the companion skill) to translate the approved mockup into an
editable Figma file using the project's real components and variables. If the Figma MCP is
unavailable or fails, the offline deliverables stand on their own — document that Figma
was not produced and continue.

The plan viewer with references is **mandatory and central**: it is what made the
original workflow valuable — the user reads and sees the screenshots, the competition
analysis, the findings, and gets ideas beyond the specific feature. Never skip it.

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
brief, findings, mockup, exported captures + reference JSON, plan viewer, and handoff are
files both tools read. The mockup is built in the offline HTML/CSS studio and exported as
local PNG captures + `reference.json` + a plan viewer with the reference screenshots, so
any implementer — OpenCode, DeepSeek, Command Code, or Codex — reads local files and
never needs Figma access. One rule: one tool writes at a time, and the handoff is the
hand-over point.

## Recommended start phrase (copy / adapt)

> Use $research-mockup to research <feature>: first read the module docs and do
> domain/concept research on the web (objective, outcomes, competitors, must-have vs
> nice-to-have), then research the flows on Mobbin, propose the UX, and build the mockup
> in HTML/CSS with the project's design tokens; capture the PNG references, build the plan
> viewer with the screenshots that inspired each phase, export the local reference
> (PNG + spec JSON) and update the inspiration center and the project context. After
> approval, offer the optional $mockup-to-figma step.

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
   - Follow `<instance>/core/workflows/research-protocol.md` in this phase.

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

1A. **Pass the project Design Foundation Gate (mandatory, BEFORE Mobbin and building).**
   - Read the repository's canonical design-system index (`docs/README.md` or the
     project equivalent), `instance/project-rules.md`, and the design-system documents
     relevant to the visible controls.
   - Locate the real source components for the screen's mobile header, navigation,
     primary action/FAB, buttons, cards, inputs, bottom sheets/overlays, typography,
     icons, motion, safe-area ownership, and themed/domain illustrations.
   - Write `<instance>/research/<feature>/design-foundation-audit.md`. For every visible
     control and surface record the source component, semantic token mapping, light/dark
     behavior, accessibility target, and evidence classification (`existing`,
     `inferred`, `inconsistent`, or `proposed`).
   - Record an illustration rationale: the user problem the illustration solves, the
     semantic palette/background token, intended asset key, and why the placement is
     not decorative. If the real asset is unavailable, use a flat project-token
     placeholder labelled `illustration placeholder` and keep the rationale in the
     audit.
   - Do not start canvas construction until every visible control has a mapping or an
     explicit `proposed` decision. “Looks similar” is not evidence.
   - If repository code and prose disagree, preserve both facts and choose a documented
     direction for the mockup; never silently invent a component or token.

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

4. **Build the mockup in HTML/CSS (default build path — mandatory, offline).**
   - Build at `<instance>/mockups/<feature>/index.html`: `tokens.css` (exact copy of the
     product tokens), `base.css` (semantic tokens only), icons/illustrations embedded,
     screens/sheets/steps in `app.js`, registered in `assets/mockups.js`, assets via
     `build-assets.mjs`. No server, no fetch, works with double-click (`file://`).
   - Apply the design rules below plus the `design-foundation-audit.md` mappings from
     step 1A. Cover the states: happy path, empty, new user, success, error, light/dark.
   - Capture light/dark PNGs under `mockups/<feature>/captures/` (headless
     `shot-mockups.mjs`).
   - **Figma is not the build path.** Do not require the Figma MCP to deliver. If the
     team later wants an editable Figma version, that is a **post-approval optional
     step** handled by the companion skill `$mockup-to-figma` (see "Approved plan ->
     viewer + handoff" below).

5. **Export the local reference (mandatory).** Write into
   `<instance>/mockups/<feature>/reference.json` a machine-readable spec that any offline
   implementer can read, covering:
   - `screens`: paths to each light/dark PNG capture (local screenshots are the shared
     visual reference).
   - `tokens`: the resolved token values used (colors, spacing, radius, type roles) pulled
     from the project's `tokens.css` — not invented values.
   - `nodes`: a per-screen mapping of component/block -> key properties (layout, fill
     token, radius, text style) so an implementer does not have to reverse-engineer the
     image.
   - `states`: which states are covered (happy, empty, new user, success, error, light/dark).
   Save the PNG captures under `mockups/<feature>/captures/`. The reference JSON + PNGs are
   what the handoff and plan viewer point at, so the implementer never needs Figma access.

6. **Verify before delivering:**
   - `node "<instance>/core/tools/check-mockups.mjs"` (0 broken images, icons injected,
     no errors) and `node "<instance>/core/tools/shot-mockups.mjs"`.
   - Visually review the captures with modlens (or the model's own vision) and confirm
     the reference JSON lists every screen and resolves to real tokens.
   - Confirm the plan viewer and handoff reference the **local captures** (relative
     paths), not only a Figma URL.

7. **Update project context.** After delivering, update
   `instance/project-context.md` (surfaces, decision log, and the `figma: <fileUrl>`) and,
   if reusable evidence was produced, the `ux-knowledge-base` (date + source + tags).

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
- **The Design Foundation Audit is a hard prerequisite.** If it is missing or a
  visible control has no mapping, stop before building and finish the audit.
- Illustrations are semantic communication assets, not decoration. Prefer the project's
  themed/domain catalog; placeholders must use a semantic token and include rationale.

## References

- `core/workflows/research-protocol.md` — concept brief and web research protocol.
- `core/workflows/mockup-studio-protocol.md` — full design rules and Mobbin protocol.
- `core/workflows/handoff-and-opencode.md` — handoff, plan viewer, and implementer bridge.
- `ux-knowledge-base/references/spec-for-ai-agents.md` — spec quality for AI implementers.
- `ux-knowledge-base/references/design-foundation.md` — pre-mockup component/token/asset
  audit and illustration rationale.
- `core/tools/build-plan-viewer.mjs` — genera el plan viewer offline con las referencias
  visuales por fase (screenshots locales de inspiración + capturas del mockup).
- Figma optional: `core/skills/mockup-to-figma/SKILL.md` — traslado post-aprobación del
  mockup aprobado a Figma (carga `figma-generate-design` / `figma-use` para la mecánica).

## Approved plan -> viewer + handoff (mandatory before implementing)

When the user approves a research + mockup:

1. Write the **reference map** in the handoff
   (`<app-repo>/docs/implementation/<feature>-handoff.md`): a table of
   component/decision -> local capture (the exported PNG under `mockups/<feature>/captures/`
   and the `reference.json` node entry) + canonical Mobbin URL -> what is taken from that
   capture (graphic, order, margins/gaps, layout, states, copy). Base it on `findings.md`,
   the modlens JSONs, and `mockups/<feature>/reference.json`. The local captures and
   reference JSON are the source of truth.
2. Create the **plan viewer** with `node "<instance>/core/tools/build-plan-viewer.mjs"
   <plan.json>`: `<instance>/mockups/plans/<id>/index.html`, half text / half references,
   navigable by phase (chips + previous/next), **local reference images (the Mobbin
   screenshots and the mockup PNG captures, never a Figma URL dependency)**, Mobbin links,
   no fetch (file://). Each phase includes the fields `files` (exact paths to read/edit/
   create/delete, including i18n and stores), `commands` (exact npm/rg commands), `checks`
   (verifiable criteria), and `refs` (the screenshots that inspired the phase, with
   caption + canonical Mobbin URL). The `refs` are **mandatory per phase** — the plan
   viewer is the place where the user sees the screenshots and findings that drive the
   creative process.
3. Register the plan in the hub ("Approved plans" section in `mockups/index.html` and
   `mockups/plans/index.html`), linking to the features' local captures.
4. **Offer the optional Figma step (after approval).** Tell the user:
   "¿Quieres trasladar este mockup aprobado a Figma (componentes editables con los tokens
   del proyecto)? Puedo hacerlo con $mockup-to-figma." Only if the user says yes — and
   only if the Figma MCP is available — run the companion skill. The offline deliverables
   (plan viewer, captures, handoff) are complete without this step.
5. The handoff must also include: the **Step -> Files -> Commands -> Acceptance check**
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
agent), the implementer must follow `core/workflows/handoff-and-opencode.md` and, at
minimum:

1. **Walk the flow map of the handoff:** every tap, button, and CTA must lead exactly to
   the specified destination. Honor the hard navigation rules from
   `instance/project-rules.md`.
2. **Compare visually against the mockup** (not just "it works"): app captures in
   light/dark compared against the exported studio captures
   (`mockups/<feature>/captures/`) using modlens; fix layout, typography, weights,
   containers, and copy differences before delivering.
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
