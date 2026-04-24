---
description: Identify underspecified areas in the current feature spec by asking up to 5 targeted clarification questions and encoding answers back into the spec.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from repo root. Parse JSON for FEATURE_DIR and FEATURE_SPEC. If parsing fails, instruct user to run `/speckits-specify` first.

2. Load the current spec file. Perform a structured ambiguity and coverage scan using this taxonomy — mark each category as Clear / Partial / Missing:
   - Functional Scope & Behavior (goals, out-of-scope, user roles)
   - Domain & Data Model (entities, attributes, relationships, lifecycle)
   - Interaction & UX Flow (user journeys, error/empty/loading states)
   - Non-Functional Quality Attributes (performance, scalability, security)
   - Integration & External Dependencies (APIs, data formats)
   - Edge Cases & Failure Handling (negative scenarios, rate limiting)
   - Constraints & Tradeoffs
   - Terminology & Consistency
   - Completion Signals (acceptance criteria testability)

3. Generate a prioritized queue of max 5 clarification questions. Each must be answerable with multiple-choice (2-5 options) or short phrase (<=5 words). Only include questions whose answers materially impact architecture, data modeling, task decomposition, or test design. For multiple-choice, provide a recommended option with reasoning.

4. Present exactly ONE question at a time. After user answers, validate and record. Stop when: all critical ambiguities resolved, user signals completion, or 5 questions asked.

5. After each accepted answer, update the spec file immediately:
   - Ensure `## Clarifications` section exists with `### Session YYYY-MM-DD` subheading
   - Append `- Q: {question} → A: {answer}`
   - Apply clarification to the most appropriate spec section
   - If the clarification invalidates earlier text, replace it (no contradictions)

6. Validate after each write: no duplicate bullets, no lingering vague placeholders, markdown structure valid, terminology consistent.

7. Report completion: number of questions asked, path to updated spec, sections touched, coverage summary table, and suggested next command.
