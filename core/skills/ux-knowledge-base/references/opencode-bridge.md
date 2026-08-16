# Continuing implementation in OpenCode

Research and design happen in this instance; implementation happens in the app
repository, usually with OpenCode. The files are the shared memory between tools: nothing
depends on chat history.

## Recommended workflow (no re-explaining)

1. Research + mockup + decisions are produced here (see ux-research.md and
   mockup-prototyping.md).
2. Write an **implementation handoff** in the app repo:
   `<app-repo>/docs/implementation/<feature>-handoff.md` (see implementation-handoff.md).
3. The app repo has an `AGENTS.md` (or `CLAUDE.md`) with a short block:

```markdown
## UX implementation context

Before implementing UI/UX changes, read:

- <instance>/core/skills/ux-knowledge-base/references/INDEX.md
  (then only the topic files relevant to the task)
- docs/implementation/<feature>-handoff.md

Follow the decisions and acceptance criteria in the handoff. If a decision cannot be
applied, stop and explain the conflict instead of improvising.
```

4. In the app repo folder, run:

```powershell
opencode run "Implement the <feature> handoff in docs/implementation/<feature>-handoff.md. Read the handoff and the knowledge base INDEX first."
```

## Vision-capable implementation

When the handoff includes a **plan viewer** and a **reference map**, extend the prompt so
the model can SEE what was decided:

> Read `<instance>/mockups/plans/<id>/index.html` (plan with phases, left text / right
> reference images) and `<app-repo>/docs/implementation/<feature>-handoff.md`. Open the
> local reference images listed in the reference map together with the mockup
> (`<instance>/mockups/<feature>/index.html`), and apply the design constraints from
> `instance/project-rules.md` and the knowledge base INDEX (tokens, surfaces, sentence
> case, motion rules). Respect the frozen surfaces listed in the handoff. Do not deviate
> from decisions; if a reference conflicts with a project rule, the rule wins and you
> note the conflict.

The plan viewer works offline (file://), so the model can open the same files on the same
machine: mockup, reference images, and constraints.

## Text-only models (DeepSeek)

For a text-only model, images are not readable directly. Analyze the reference captures
and the mockup screenshots with ModLens first, then pass the structured JSON descriptions
to the implementer as text, along with the handoff. The verification section of the
handoff lists the captures to describe.

## Checklist before handing off

- [ ] Plan viewer has `files`, `commands`, and `checks` in every phase.
- [ ] Handoff has the step-by-step file map table.
- [ ] Handoff lists frozen surfaces and never-delete files.
- [ ] The local reference images exist.
- [ ] The app repo AGENTS.md contains the UX implementation context block.
