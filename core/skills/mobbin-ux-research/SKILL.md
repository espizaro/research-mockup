---
name: mobbin-ux-research
description: "Research and decide UX/UI with real Mobbin references, without being tied to a specific product. Use when the user asks to research on Mobbin, find how other apps or sites solve a UX flow or problem, compare UI patterns (onboarding, login, checkout, forms, navigation, empty states, modals vs full screens, etc.), or build design evidence for a decision. Abstracts the problem into real usage flows, searches screens with the official Mobbin API (fallback: authenticated browser), analyzes them visually with ModLens, and delivers findings with links and recommendations. Does not edit product or require a specific repository."
---

# Mobbin UX Research

## Purpose and boundary

Turn a UX problem into evidence from real app and web flows, and deliver a traceable recommendation. The skill researches and recommends; it does not implement or modify product. It is not tied to a specific project: it works for any product or domain.

## Channels and evidence hierarchy

1. **Official Mobbin REST API** (primary channel): use `scripts/mobbin-search.mjs`.
2. **Authenticated Mobbin web in the browser** (fallback or complement): for full flows, videos, and visual inspection the API does not cover. The user completes login, 2FA, or CAPTCHA; never ask for, read, or store their password.
3. **Public sources** (design systems, official documentation, Figma Community, open-source projects) when Mobbin is not enough.

Do not mass-scrape, download complete catalogs, bypass access controls, or violate rate limits, licenses, or terms of service. If the API fails, record the exact query and error and try the next channel; do not attribute findings to screens you have not seen.

## Credentials

Read the key from the `MOBBIN_API_KEY` environment variable, or from `work/api_keys.txt` (line `MOBBIN_API_KEY=...`) in the working directory; `--key-file` allows another path. Never print keys or send them in URLs. If missing, state exactly which variable or file is expected.

## Research workflow

### 1. Abstract the problem

Write: specific problem, transferable abstract problem, user goal, constraints, hypotheses, and questions the research must answer. Think in **real flows**, not only screens: what the user does before and after, decisions, states, errors, and context. Read `references/ux-research-method.md`.

### 2. Design at least five abstract queries

Cover: goal, structure/interaction, alternative domain, opposite pattern, and mobile/web variant. Do not repeat the original domain vocabulary in every query.

### 3. Search the API

```bash
node scripts/mobbin-search.mjs --query "fingerprint login" --platform ios --limit 10
node scripts/mobbin-search.mjs --query "health onboarding" --platform web --limit 8 --download-dir work/mobbin-captures
```

Options: `--platform ios|web` (the API only accepts these; omit for all), `--limit` (default 10, max 50), `--out file.json`, `--download-dir folder` (downloads images), `--key-file path`. On 429, wait and retry with backoff or lower the limit; if it persists, use the browser.

### 4. Examine images, not just metadata

Download candidates and analyze them with the **modlens** skill (`modlens -i <path>`). Cite only screens you actually saw. For each reference capture: product, context, full flow, pattern, why it works, limits, what transfers, and what not to copy.

### 5. Synthesize by flow

Group findings by flow (user goal), not by isolated screen: entry points, steps, decisions, states, errors, exits. Detect recurring patterns and counterexamples. If there are design alternatives, build a comparison matrix with criteria such as clarity, cognitive load, speed, frequency, error risk, accessibility, scalability, and engineering effort.

### 6. Deliver the report

Include: problem, goal, queries used, findings by flow, recurring patterns, matrix and recommendation, canonical Mobbin links for every screen used, evidence vs inference, and uncertainties. Do not invent screens or results.

## Cost and privacy

Each image analyzed with ModLens costs ~$0.002 and is sent to Gemini. Warn the user if the domain or images are sensitive. The Mobbin API returns metadata and image URLs, not flow videos or private collections.

## Failures

- Missing key or 401: state the expected variable or file.
- 429: retry with backoff, lower `--limit`, or switch to the browser.
- ModLens fails: report the error; never describe an unseen image.
- Material ambiguity: ask; if not critical, assume and declare the assumption.

## Usage examples

- "Research on Mobbin how other apps do health onboarding."
- "Compare mobile checkout flows across e-commerce apps."
- "Bottom sheet or full screen for adding an address? Find evidence."
- "Find empty-state references in finance apps."
