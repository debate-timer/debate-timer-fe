---
description: Identify underspecified areas in the feature specification and resolve them interactively.
---

### Strict Mode

If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### Phase 1: Research & Discovery

**Goal:** Analyze the current specification for ambiguities and load foundational constraints.

1.  **Initialize Topic:** Call `update_topic` with the goal of clarifying the specification.
2.  **Read Specification:** Use `read_file` to load `./specs/spec.md`. All artifacts MUST reside in the `./specs/` directory.
3.  **Analyze Content:** Scan the specification for `[NEEDS CLARIFICATION]` markers or areas lacking detail (e.g., edge cases, error handling).

### Phase 2: Strategy & Planning

**Goal:** Formulate targeted questions for the user.

1.  **Draft Questions:** Generate up to 10 targeted, multiple-choice or short-answer questions to resolve the ambiguities.
2.  **Strategy Update:** Call `update_topic` to inform the user that questions are ready.

### Phase 3: Execution & Implementation

**Goal:** Ask questions and update the specification.

1.  **Interactive Session:** Use the `ask_user` tool to present the questions one by one or in a single form.
2.  **Update Specification:** Use `replace` or `write_file` to apply the answers to `./specs/spec.md`. Ensure clarifications replace vague placeholders and resolve contradictions, remaining aligned with the Project Constitution. All changes MUST be saved within the `./specs/` directory.
3.  **Execution Update:** Call `update_topic` as updates are applied.

### Phase 4: Validation & Finalization

**Goal:** Confirm the specification is unambiguous.

1.  **Verify Updates:** Check `./specs/spec.md` to ensure no `[NEEDS CLARIFICATION]` markers remain.
2.  **Final Update:** Call `update_topic` summarizing the resolved areas.
3.  **Next Steps:** Suggest proceeding to the Plan workflow.
