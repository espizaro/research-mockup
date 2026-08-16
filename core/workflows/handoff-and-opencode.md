# Handoff and OpenCode bridge

- After research + mockup, write `docs/implementation/<module>-handoff.md` in the target repo (English) using the template in `ux-knowledge-base/references/implementation-handoff.md`.
- Approved plans must be **integral**: plan viewer with `files` / `commands` / `checks` per phase, and a handoff with the Step → Files → Commands → Acceptance check table (i18n and stores named per step), frozen surfaces, never-delete files, and the "Spec quality checklist" (see `ux-knowledge-base/references/spec-for-ai-agents.md`).
- Add to the repo AGENTS.md a block that points to the instance knowledge base INDEX and the handoff.
- Run OpenCode from the repo folder:
  opencode run "Implement docs/implementation/<module>-handoff.md. Read that file and the instance knowledge base INDEX first."
- For vision-capable models, point first to the plan viewer
  (`outputs/mockups/plans/<id>/index.html`) so they see the reference images next to each
  phase, then the handoff; instruct: verify premises against the code, plan wins on
  conflict, `[NEEDS CLARIFICATION]` on real gaps, frozen surfaces byte-for-byte.
- OpenCode can also be driven from Codex via `opencode run` (CLI installed), but there is no shared memory: the handoff doc is the portable context.
