# Research Mockup

An offline, project-agnostic workspace that turns a feature idea into a researched,
decision-backed, navigable HTML mockup — with a plan viewer that shows the reference
screenshots (Mobbin + findings) next to each implementation phase, and a handoff with
exact files, commands, and acceptance checks. No server, no guessing, no Figma required.
Figma is an optional post-approval step via the companion `mockup-to-figma` skill.

It ships with a seed catalog of real Mobbin screenshots so the workspace has content to
browse from the first minute. Your project data is never mixed with anyone else's.

## Start here (one command)

1. Install Node.js and Git (the setup wizard verifies this for you).
2. Clone this repository.
3. Open PowerShell in the repository root and run:

```powershell
.\setup.ps1
```

The wizard explains each choice in plain language — where you want to use the workspace
(ChatGPT desktop app, Cursor, or both), your Mobbin key, your app's location, and the
design system — and configures everything automatically. It installs the skills for the
tools you chose. At the end it prints the exact command to start working — copy and paste
it.

To update the engine later without touching your data:

```powershell
.\setup.ps1 -Update
```

That also re-asks where the skills should be installed.

## What you get

- **Inspiration catalog** — searchable, offline index of real app screenshots with analysis.
- **`research-mockup` skill** — domain research → Mobbin research → UX proposal → mockup
  (HTML/CSS), plan viewer with reference screenshots, handoff; always loaded with your
  project's context.
- Works with **ChatGPT (Codex) and/or Cursor** — the installer puts the skills wherever
  you choose, and the repo ships a `.cursor/rules/research-mockup.mdc` so Cursor loads
  the workflow right after cloning.
- **`mockup-to-figma` skill** — optional post-approval translation of an approved mockup
  into an editable Figma file (components + variables of the project).
- **Mockup studio** — navigable HTML/CSS mockups using your app's real design tokens.
- **Design Foundation** — if your app has no design system yet, the setup adopts a
  complete, current one for you (M3 Expressive motion, bottom sheets, typography,
  copywriting, accessibility) instead of starting from zero.
- **Implementation handoffs** — approved plans with exact files, commands, and checks,
  plus an offline plan viewer (screenshots + findings per phase) for vision-capable
  models and curious humans.
- **ModLens vision bridge** — lets a text-only model (like DeepSeek) "see" screenshots.
- **Two tools, one context** — research in ChatGPT/Codex or Cursor and implement anywhere
  (including OpenCode): they all read the same instance, and the handoff carries
  everything across.
- **From zero or existing code** — works with an existing repository, or as the blueprint
  for an app that does not exist yet (research → mockup → build spec).

## Layout

| Path | Contents |
|---|---|
| `core/` | The engine: skills, workflows, tools. Updated from the template. |
| `instance/` | Your project: context, rules, API keys. Never shared. |
| `screens/` | Screenshots organized by flow, with metadata and analysis. |
| `research/` | Findings and decisions per investigation. |
| `mockups/` | The mockup studio and approved plans. |
| `catalog/` | The searchable inspiration center (engine + generated data). |

## Update the engine

```powershell
.\setup.ps1 -Update
```

This pulls newer versions of `core/` without touching your `instance/`, `screens/`,
`research/`, or `mockups/` data, and re-asks where the skills should be installed.

## Multiple projects, zero mixing

The skill is always project-agnostic — it never bakes in an app. Every app gets its own
instance folder, and the agent loads the context of the folder where you opened the
session:

- ChatGPT/Codex, Cursor, and OpenCode scope sessions to the folder they were started in;
  `AGENTS.md` and the skills are discovered from that folder upward.
- The skill resolves the active project by finding `instance/project-context.md` from the
  current folder, or by matching the folder against the registry at
  `~/.config/research-mockup/instances.json`.
- In the ChatGPT desktop app, create one local project per app (primary folder = that
  app's instance or code repo) and keep the chats inside that project.

Work on app A in app A's folder, app B in app B's folder. Instances share nothing except
the agnostic engine in `core/` — each one keeps its own context, rules, keys, catalog,
research, and mockups.

## License and data notes

- Mobbin screenshots are used under Mobbin's terms for your own research; do not
  redistribute them publicly.
- Your Mobbin key lives in `instance/.env`, which is git-ignored and never committed.
