---
description: Generate an implementation plan and design artifacts based on the specification.
---

### Strict Mode
If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### Phase 1: Research & Discovery
**Goal:** Gather all necessary requirements for planning.
1.  **Initialize Topic:** Call `update_topic` to indicate the start of the planning phase.
2.  **Read Specification:** Use `read_file` to read `./specs/spec.md`.
3.  **Explore Codebase:** Use `glob` or `grep_search` to understand existing architectural patterns in `./src/`.

### Phase 2: Strategy & Planning
**Goal:** Draft the technical approach.
1.  **Draft Architecture:** Define the tech stack, data models, and component hierarchy based on the specification.
2.  **Check Constraints:** Ensure the plan adheres to any project constitutions or architectural guidelines.
3.  **Ensure Traceability:** Ensure every planned implementation explicitely maps back to an edge case or requirement in `spec.md`.
4.  **Strategy Update:** Call `update_topic` to share a summary of the technical strategy.

### Phase 3: Execution & Implementation
**Goal:** Create the planning documents.
1.  **Execution Update:** Call `update_topic` before writing files.
2.  **Verify Structure:** Verify every file path against the actual project structure (e.g., via `run_shell_command` with `tree` output or `list_directory`) to ensure the plan references valid paths.
3.  **Write Plan File:** Use `write_file` to create `./specs/plan.md`. This artifact MUST be stored in the `./specs/` directory.
4.  **Write Auxiliary Files:** Use `write_file` to generate any necessary diagrams, data models (e.g., `./specs/data-model.md`), or API contracts. These MUST ALSO reside strictly within the `./specs/` directory.

### Phase 4: Validation & Finalization
**Goal:** Verify completeness of the planning artifacts.
1.  **Verify Structure:** Use `list_directory` on `./specs/` to ensure `plan.md` and related files exist.
2.  **Final Update:** Call `update_topic` to recap the generated planning artifacts.
3.  **Next Steps:** Suggest running the Tasks workflow to break down the plan.
