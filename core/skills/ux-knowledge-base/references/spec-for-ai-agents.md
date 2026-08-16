# Spec for AI agents — how to write plans an agent can execute

Purpose: turn approved research + mockups into plans that a fresh agent (OpenCode, Claude
Code, another Codex chat) can execute without re-doing the investigation and without
inventing behavior.

## Evidence (researched 2026-08-08)

- **Addy Osmani — "How to write a good spec for AI agents"** (Jan 2026,
  <https://addyosmani.com/blog/good-spec/>): six areas every spec must cover (commands,
  testing, project structure, code style, git workflow, boundaries); specs are living
  artifacts maintained like code; break work into small, isolated tasks; choose model
  and context budget per task.
- **GitHub Spec Kit** (<https://github.com/github/spec-kit>): Spec → Plan → Tasks →
  Implement; each phase produces a Markdown artifact that feeds the next; gated
  checkpoints before advancing.
- **Vercel — "AGENTS.md outperforms skills in our agent evals"** (Jan 27, 2026,
  <https://vercel-docs.vercel.sh/blog/agents-md-outperforms-skills-in-our-agent-evals>):
  a compressed ~8KB docs index embedded in AGENTS.md reached 100% pass rate; skills with
  explicit instructions reached 79%; baseline 53%. Prefer retrieval-led reasoning over
  pre-training-led reasoning.
- **tworkflow** (<https://github.com/clarity-digital-development/tworkflow>): write the
  plan document first, then make the agent verify the plan's premises against the actual
  code before it writes anything.
- **CRISPY / qrspi-agent** (multi-stage workflows): plans constrained by design and
  structure with a file-level change checklist, risk level per change, executable test
  strategy and rollback checkpoints.
- **Addy Osmani — agent-skills** (<https://github.com/addyosmani/agent-skills>):
  "Process, not prose"; include anti-rationalization tables (common excuses the agent
  might use to skip steps) with counter-arguments.

## The six spec areas (every plan must cover)

1. **Commands** — exact commands per step (typecheck, lint, tests, build, format, guard
   scripts, `rg` probes to prove deletions) and when to run them.
2. **Testing** — which tests exist, which to run per step, and what "passing" looks like.
3. **Project structure** — files to read first, architecture constraints, where new files
   must live.
4. **Code style** — tokens, sentence case, no borders/shadows exceptions, naming, a small
   concrete example.
5. **Git workflow** — branches, commit messages, when to commit or tag (rollback points).
6. **Boundaries** — three tiers: Always allowed / Ask first / Never touch (frozen
   surfaces, generated files, secrets).

## Gated phases

Specify → Plan → Tasks → Implement. Each phase produces a Markdown artifact; the agent
does not advance until the previous gate passes (for example: baseline typecheck/lint/tests
green before editing).

## Task decomposition rules

- One task = one coherent change with its own verification.
- Provide a file-level change checklist per task: paths to read, edit, create and delete.
- Mark risk per change and a rollback checkpoint (commit/tag) before risky steps.
- Give an executable test strategy: exact command + expected result.
- Use `[NEEDS CLARIFICATION]` instead of inventing behavior. Stop that task and report;
  do not guess.

## Acceptance criteria

- Write criteria that can be tested: "button disabled when the field is empty" beats
  "validate the form". If it can be a test, the detail is correct.
- State negative cases explicitly: what NOT to do and what not to touch.

## Context loading

- Keep a compressed docs index in AGENTS.md (Vercel evidence) and instruct: "Prefer
  retrieval-led reasoning over pre-training-led reasoning."
- Keep the handoff inside the target repo so it travels with the code.
- The implementing agent reads, in order: plan viewer (with reference images) → handoff →
  UX knowledge base INDEX (only relevant topics) → repo AGENTS.md.

## Anti-rationalization

Include counters for common excuses: "I'll add tests later", "this legacy file is
harmless", "the mockup is just a draft", "the plan didn't say it, so I'll improvise".
The plan wins over the code; a real gap stops the task with `[NEEDS CLARIFICATION]`.

## Checklist before handing off a plan

- [ ] Exact commands per step (npm scripts and `rg` probes named)
- [ ] Exact file paths: read / edit / create / delete
- [ ] i18n and store files named per step
- [ ] Acceptance check per step (testable)
- [ ] Boundaries: frozen and never-delete files listed
- [ ] `[NEEDS CLARIFICATION]` protocol stated
- [ ] "Plan wins" rule stated
- [ ] Baseline commands included (state before editing)
- [ ] Reference map included for vision-capable implementers (local images + Mobbin URLs)

## Tags

planning, handoff, spec, AI agents, OpenCode, implementation, acceptance criteria,
gated phases, boundaries.
