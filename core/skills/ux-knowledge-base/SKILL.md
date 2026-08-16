---
name: ux-knowledge-base
description: Indexed, project-agnostic UX/UI knowledge base built from real research. Use when designing or deciding flows, screens, mockups, empty states, typography, motion, navigation, check-ins, or dashboards; before starting UX research; when prior investigations should inform current work; and after investigations to store reusable findings. Always read references/INDEX.md first, load only the relevant files, apply the patterns, and update the base when new reusable evidence appears.
---

# UX Knowledge Base

Project-agnostic library of UX/UI evidence and decisions. The goal is to never re-explain or re-research the same pattern twice, and to make every design decision traceable to a source.

## Mandatory workflow

1. **Read `references/INDEX.md` first.** It maps every file to "read when".
2. **Load only relevant files.** Do not load the whole base.
3. **Apply patterns with judgment.** Project-specific constraints override generic patterns; record the deviation when it matters.
4. **Update after investigations.** If research produced reusable evidence (new pattern, source, decision), add or update the corresponding file and add an entry to the INDEX update log. Files are written in English, standalone, and tagged with date + source.
5. **Generate implementation handoffs.** When research/planning is followed by implementation in another tool (e.g. OpenCode), write a handoff document in the target repo using `references/implementation-handoff.md`, follow `references/opencode-bridge.md`, and apply the plan-quality standard in `references/spec-for-ai-agents.md` (exact files, commands and checks per step; `[NEEDS CLARIFICATION]` protocol; plan wins).

## File map

| File | Read when |
|---|---|
| `references/typography.md` | choosing type roles, weights, sizes, casing, hierarchy |
| `references/visual-style.md` | surfaces, borders, shadows, motion, layout rules |
| `references/empty-states.md` | designing empty/loading/new-user states |
| `references/daily-check-in.md` | mood/wellbeing/EMA check-ins, daily logging |
| `references/today-dashboard.md` | home/dashboard structure, actions, metrics |
| `references/ux-research.md` | starting a Mobbin/web research cycle |
| `references/mockup-prototyping.md` | building navigable HTML mockups without Figma |
| `references/implementation-handoff.md` | handing research+mockup to an implementer |
| `references/spec-for-ai-agents.md` | writing or reviewing plans/handoffs for AI implementers |
| `references/opencode-bridge.md` | continuing implementation in OpenCode |

## Related skills

- `mobbin-ux-research` — official Mobbin API searches and analysis.
- `research-mockup` — the research-to-mockup workflow for the current project.
