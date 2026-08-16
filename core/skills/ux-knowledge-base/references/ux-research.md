# UX research cycle (Mobbin + web)

Companion to the `mobbin-ux-research` skill. Use this when starting any research cycle, in any product.

## Order

1. **Understand the domain first** (always). Read product docs, domain contracts, existing views, and every surface where the feature appears (home, notifications, links, chat, timeline). Search docs in both the primary language and English. Before declaring a gap, answer: where does the user see this besides the main view?
2. **Design ≥ 5 abstract queries** (goal, structure, interaction, alternative domain, opposite pattern) in English, without repeating the same vocabulary in all of them. Example: for a health check-in, mix "mood logging", "daily journal onboarding", "habit tracker morning routine", "financial wellness check-in".
3. **Search Mobbin** with the official API: 6-8 captures per flow (10-12 for complex flows). Save per-flow metadata + images; rename `NN - App.webp`; deduplicate by screen id (hardlinks).
4. **Analyze every capture** with a vision bridge (modlens) and write `hallazgos.md`/`findings.md` per flow: pattern, why it works, limits, what is transferable, what not to copy, canonical links.
5. **Web research for what Mobbin cannot show**: empty states, first-run, accessibility, best practices, academic evidence. Prefer primary sources (NN/g, JMIR, Apple HIG, official product guides). Record URLs.
6. **Update the inspiration center**: canonical catalog lives at `catalog\index.html` in this repo; run `node tools\build-catalog.mjs` after adding captures.
7. **Write the decision document** (in the product's repo, in English): what to include, what to drop/adjust, evidence per decision, open questions resolved.
8. **Update this knowledge base** with reusable findings (date + source + tags).
9. **Build the mockup** (see mockup-prototyping.md) and generate the implementation handoff (see implementation-handoff.md).

## Evidence hierarchy

- Primary source / study / official guideline > reputable editorial > blog > capture without analysis.
- A capture is evidence only if the image was actually viewed (never attribute findings to unseen screenshots).
- If the evidence is inconclusive (e.g. JMIR found no main effects), say so instead of forcing a conclusion.

## Mobbin terms of use

No mass scraping; no attributing findings to captures not viewed.