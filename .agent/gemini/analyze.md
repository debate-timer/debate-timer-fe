---
description: Finalize the design-to-implementation handoff by generating a project overview and specific task documents.
---

### Strict Mode
If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### Phase 1: Research & Discovery
**Goal:** Ingest all design and planning artifacts.
1.  **Initialize Topic:** Call `update_topic` to begin the final analysis and handoff generation.
2.  **Read Artifacts:** Use `read_file` (parallelized) to load `./specs/spec.md`, `./specs/plan.md`, and `./specs/tasks.md`.

### Phase 2: Strategy & Planning
**Goal:** Structure the handoff documentation.
1.  **Draft Overview:** Synthesize a "bird's-eye view" of the system architecture and goals based on the loaded artifacts.
2.  **Map Individual Tasks:** Prepare the precise instructions, context, and requirements for each task listed in `tasks.md`.
3.  **Strategy Update:** Call `update_topic` detailing the handoff structure to be generated.

### Phase 3: Execution & Implementation
**Goal:** Generate the handoff files.
1.  **Execution Update:** Call `update_topic` before writing the handoff files.
2.  **Create Overview Document:** Use `write_file` to create `./specs/tasks/00-project-overview.md`. This document must summarize the entire system architecture, goals, and technical decisions.
3.  **Create Task Documents:** Use `write_file` (or delegate to a sub-agent using `invoke_agent` if there are many) to create an individual file for each task (e.g., `./specs/tasks/task-01-[name].md`, `./specs/tasks/task-02-[name].md`). Each file MUST contain precise instructions, context, and requirements for the next agent to implement.

### Phase 4: Validation & Finalization
**Goal:** Verify the integrity of the final handoff directory.
1.  **Verify Structure:** Use `list_directory` on `./specs/tasks/` to confirm the presence of `00-project-overview.md` and all individual task files.
2.  **Consistency Check:** Spot check a task file (using `read_file`) to ensure it logically aligns with the `00-project-overview.md` and previous specs.
3.  **Validate Handoff Readiness:** Ask the critical question: "Would a new developer be able to implement this without asking a single question?" If not, identify the remaining ambiguities and halt execution to ask the user for clarification before finalizing.
4.  **Final Update:** Call `update_topic` to declare the design phase complete and ready for implementation.
