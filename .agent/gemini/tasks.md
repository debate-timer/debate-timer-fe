---
description: Generate an actionable, dependency-ordered task list based on the specification and plan.
---

### Strict Mode
If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### Phase 1: Research & Discovery
**Goal:** Load the specification and plan artifacts.
1.  **Initialize Topic:** Call `update_topic` to begin task breakdown.
2.  **Read Artifacts:** Use `read_file` (parallelized) to read `./specs/spec.md` and `./specs/plan.md`.
3.  **Verify Structure:** Verify every file path against the actual project structure (e.g., via `run_shell_command` with `tree` output or `list_directory`) to ensure tasks reference existing architecture correctly.

### Phase 2: Strategy & Planning
**Goal:** Deconstruct the plan into a logical sequence of tasks.
1.  **Identify Tasks:** Break the work down into actionable items mapped to user stories and technical phases.
2.  **Determine Dependencies:** Sequence the tasks (Setup -> Foundational -> Feature -> Polish) and identify parallelization opportunities.
3.  **Ensure Traceability:** Ensure every task explicitly maps back to an edge case or requirement in `spec.md`.
4.  **Strategy Update:** Call `update_topic` to summarize the planned task phases.

### Phase 3: Execution & Implementation
**Goal:** Write the consolidated task list.
1.  **Execution Update:** Call `update_topic` before writing.
2.  **Write Tasks File:** Use `write_file` to create `./specs/tasks.md`. This MUST reside strictly in `./specs/`. Ensure each task has a clear ID, description, related file paths, and a direct reference to the originating requirement or edge case in `spec.md`.

### Phase 4: Validation & Finalization
**Goal:** Validate task coverage against requirements.
1.  **Verify Coverage:** Ensure every user story and edge case in `spec.md` has corresponding tasks in `tasks.md`.
2.  **Final Update:** Call `update_topic` to report the total number of tasks generated.
3.  **Next Steps:** Suggest running the Analyze workflow for the final handoff generation.
