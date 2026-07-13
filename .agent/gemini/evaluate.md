---
description: Evaluate design and planning artifacts to determine readiness for the implementation phase.
---

### Strict Mode

If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### Phase 1: Context & Discovery

**Goal:** Ingest all relevant design and planning artifacts for comprehensive evaluation.

1.  **Initialize Topic:** Call `update_topic` to indicate the start of the rigorous evaluation phase.
2.  **Explore Context:** Use `read_file` to read the `README.md` for project overview and domain context.
3.  **Read Constitution:** Use `read_file` to read the 'Project Constitution' at `./.specify/memory/constitution.md`. All subsequent stages must be strictly governed by the principles found in this Constitution.
4.  **Ingest Specs Directory:** Use `list_directory` and `read_file` (parallelized) to read all summary and design documents located in the `./specs/` directory (e.g., `spec.md`, `plan.md`, `tasks.md`).
5.  **Ingest Tasks Directory:** Use `list_directory` and `read_file` (parallelized) to read all handoff documents located in the `./specs/tasks/` directory (e.g., `00-project-overview.md` and all individual `task-*.md` files).

### Phase 2: Rigorous Evaluation

**Goal:** Critically evaluate the artifacts against 7 strict Boolean criteria. Act as an Auditor: be highly critical and focused on minimizing errors for the upcoming implementation phase. Do not assume completeness without concrete evidence in the documentation.

1.  **Evaluate:** For each of the following criteria, determine a strict `[Yes/No]` status based on your analysis:
    - **Requirement Traceability:** Are all initial requirements from the 'Specify' stage fully reflected in the final tasks?
    - **Task Atomicity:** Are individual tasks broken down into atomic units that can be implemented in a single session?
    - **Contextual Grounding:** Is every design decision based on provided project context rather than hallucination or arbitrary assumptions?
    - **Unambiguity:** Is the documentation free of vague adjectives (e.g., 'appropriately', 'efficiently') and providing clear technical instructions?
    - **Directory Discipline:** Are all artifacts correctly stored in `./specs/` or `./specs/tasks/` according to the naming convention?
    - **Technical Feasibility:** Is the design realistically implementable within the current tech stack (React/TypeScript)?
    - **Handoff Completeness:** Can a new implementation agent start working immediately with only the provided task documents?

### Phase 3: Reporting & Verdict

**Goal:** Generate the final evaluation report.

1.  **Execution Update:** Call `update_topic` to indicate the evaluation is complete and the report is being drafted.
2.  **Write Report:** Use `write_file` to create exactly `./specs/non-deterministic-eval.md`.
3.  **Report Format Constraints:** The generated file MUST strictly adhere to this format:
    - For each of the 7 criteria, write: `**[Criterion Name]: [Yes/No]**` followed by a paragraph containing exactly **3 to 5 lines of evidence/reasoning** justifying the status.
    - **Final Verdict:** Provide a concluding statement clearly stating whether the team should proceed to the 'Implement' stage or halt to revise the design.
    - **Score:** On a separate line, display the final score in the exact format: `**Score: n/7**` (where 'n' is the number of 'Yes' criteria out of 7 total).

### Phase 4: Finalization

**Goal:** Conclude the audit workflow.

1.  **Final Update:** Call `update_topic` to report the final Score (n/7), the Verdict, and confirm that `./specs/non-deterministic-eval.md` has been successfully written.
