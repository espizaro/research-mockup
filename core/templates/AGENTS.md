# AGENTS.md — {{APP_NAME}} research workspace

This repository is the research and mockup workspace for {{APP_NAME}}. It is a private,
project-specific instance generated from the Research Mockup template.

## What you must read before any UX/UI or research task

1. `instance/project-context.md` — identity, repos, design system, surfaces, decision log.
2. `instance/project-rules.md` — design constraints, frozen surfaces, navigation rules.
3. `core/skills/ux-knowledge-base/references/INDEX.md`, then only the relevant topic files.
4. `core/skills/research-mockup/SKILL.md` for the full research-to-mockup protocol.

## Rules

- Every design decision must cite its source (Mobbin flow, web source, project constraint)
  and be recorded in `instance/project-context.md` (decision log).
- Update the inspiration center after every research cycle
  (`node core/tools/build-catalog.mjs`).
- Everything written into this repository is in English.
- Never commit secrets; the Mobbin key lives in `instance/.env` (git-ignored).
