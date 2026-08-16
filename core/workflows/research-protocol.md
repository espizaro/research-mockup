# Research protocol (Research Mockup + Mobbin)

1. **Domain, concept and outcomes (mandatory, before Mobbin).** Read the module docs and
   code (all surfaces: home, notifications, links, chat; i18n; EN+ES vocabulary) AND research
   on the web: job to be done, direct/indirect competitors, category best practices,
   must-have vs nice-to-have, white space. If the user did not define the objective, propose
   the outcome as a hypothesis and validate with 1-3 questions at the end. Save
   `concept-brief.md` in the flow folder.
2. Design >= 5 abstract queries (goal, structure, interaction, alternative domain, opposite
   pattern), in English, derived from the concept brief.
3. Search Mobbin API (6-8 captures/flow; 10-12 for complex), save to `screens/<flow>/` with
   `metadata.json`, rename `NN - App.webp`, dedupe by screen id.
4. Analyze captures with a vision bridge (modlens) and write `findings.md` per flow.
5. Web research for what Mobbin cannot show (empty states, first-run, accessibility,
   academic evidence, product decisions); record URLs.
6. Regenerate catalog: `node tools/build-catalog.mjs`.
7. Write the decision document in the product repo (English), and the implementation handoff.
8. Update the `ux-knowledge-base` skill with reusable findings (date + source + tags).
9. Commit in this instance; push to GitHub is done by the owner.
