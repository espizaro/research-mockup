# {{APP_NAME}} — Project Rules

Loaded automatically by the `research-mockup` skill. These constraints override the
generic design rules whenever they conflict. Everything in this file comes from the
project itself; edit it as the product evolves.

## Design constraints

- Token usage rules (e.g. only semantic tokens, never raw hex).
- Surface rules (borders, shadows, elevation).
- Typography (casing, weights, role limits).
- Motion and transitions.
- Layout and safe areas.

## Frozen surfaces (never modify)

UI or UX that must remain byte-for-byte unchanged during implementation:

- _add surfaces here as they are frozen_

## Hard navigation rules

Specific navigation contracts that implementation must respect:

- _example: tapping X always opens Y, never Z_

## Copy and language rules

- Voice and tone.
- Terminology table (approved names for features, buttons, states).

## Verification standards

- Commands that must pass before delivering (typecheck, lint, tests, studio checks).
- Visual comparison requirements (mockup vs. implementation, light/dark).
