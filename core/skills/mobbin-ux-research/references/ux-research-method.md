# UX Research Method

## Problem abstraction

Before searching, turn the request into five elements:

1. **Specific problem**: what the user said.
2. **Abstract problem**: the underlying friction without the original domain (e.g., "how to confirm an irreversible decision" instead of "delete medication button").
3. **User goal**: what the user is trying to achieve and in what context.
4. **Constraints**: technical, content, safety, and business constraints.
5. **Research questions**: what the evidence must resolve.

## Friction types to diagnose

- Information architecture and hierarchy.
- Navigation and context loss.
- Interaction and affordance (does it look tappable?).
- Comprehension (language, jargon, units).
- Density and decision overload.
- States: empty, loading, error, success, offline, content limits.
- Feedback and validation (form errors, confirmations).
- Accessibility and touch target size.
- Consistency and scalability.

## Query design

Create at least five abstract queries:

- **Goal**: "how to complete <action> without friction".
- **Structure/interaction**: "progressive disclosure in long forms".
- **Alternative domain**: the same pattern in another industry (e.g., banking for health).
- **Opposite pattern**: the alternative choice (modal vs full screen).
- **Platform variant**: mobile and web separately.

Do not use the product's vocabulary in every query; Mobbin searches with natural language.

## Analyze by flow, not by screen

For each reference, capture the full flow:

- **Entry**: where does it start? Notification, card, button?
- **Steps**: how many? Can the user exit/go back?
- **Decisions**: what does the user choose? Defaults?
- **States**: loading, empty, error, success, limits.
- **Exit**: where does success lead? What happens on cancel?

For each seen screen, record: product, context, pattern, why it works, limits, what transfers, and what not to copy (branding, copy, data).

## Comparison matrix

When the user hesitates between alternatives, compare with explicit criteria: clarity, cognitive load, speed, usage frequency, content volume, complexity, context persistence, error risk, domain sensitivity, accessibility, scalability, consistency, engineering effort, and reusability. Prefer honest qualitative evaluation over falsely precise scores.

## Report structure

1. Executive summary.
2. Problem and goal.
3. Assumptions and constraints.
4. Queries executed.
5. Findings by flow (with canonical links).
6. Recurring patterns and counterexamples.
7. Comparison matrix (if applicable).
8. Recommendation and why.
9. Risks and uncertainties.
10. Sources (Mobbin links and others).

## Weak-solution signals (anti-patterns)

- The pattern only works with short content.
- It forces recalling information between steps without a summary.
- The primary action competes with secondary ones.
- Error/loading/empty states are unresolved.
- Accessibility is an afterthought (sizes, contrast, focus).
- The pattern is copied without adapting to the user's context.
