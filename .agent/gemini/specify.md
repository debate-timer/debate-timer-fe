---
description: Create or update a feature specification focusing on what users need and why using a template-first approach.
---

### Strict Mode

If any ambiguity, missing information, or unverified technical detail is encountered, the agent MUST immediately stop execution and ask the user for clarification. Do not guess, do not assume, and do not proceed with uncertainty.

### .gitignore Hygiene

The agent must ensure that any temporary files, logs, or sensitive information generated during the specification process are not tracked by git, strictly adhering to `.gitignore` rules.

### Phase 1: Initialization & Human-in-the-Loop

**Goal:** Provide the user with the requirement template and wait for input.

1.  **Initialize Topic:** Call `update_topic` to start the specify workflow.
2.  **Check Existing Template:** Use `list_directory` or `read_file` to check if `./specs/feature-request.md` already exists and is filled out.
3.  **Step 1 (Initialization):** If `./specs/feature-request.md` does not exist or is empty, the agent MUST copy `./.agent/gemini/feature-request-template.md` to `./specs/feature-request.md`. (You can use `read_file` on the template and `write_file` to the destination).
4.  **Step 2 (Human-in-the-Loop):** Once the template is copied, the agent MUST STOP execution and instruct the user in Korean: "요구사항 템플릿이 `./specs/feature-request.md`에 생성되었습니다. 내용을 채워 넣은 후 다시 호출해 주세요." Do not proceed further until the user returns.

### Phase 2: Research & Discovery

**Goal:** Read user requirements and project context.

1.  **Explore Context:** Once the user confirms the template is filled, use `read_file` to read the `README.md` for project overview and domain context.
2.  **Read Filled Template:** Use `read_file` to read the contents of `./specs/feature-request.md`.
3.  **Read Constitution:** Use `read_file` to read the 'Project Constitution' at `./.specify/memory/constitution.md`. All subsequent stages must be strictly governed by the principles found in this Constitution.

### Phase 3: Formalization & Strategy

**Goal:** Define the feature scope and finalize the formal specification.

1.  **Silent Self-Correction:** Review the loaded Constitution one more time silently. Ensure your planned implementation for the feature request does not violate any architectural principles or prohibitions before writing any code.
2.  **Analyze Requirements:** Analyze the filled `feature-request.md` against the Project Constitution.
3.  **Draft Formal Spec:** Structure the formal specification (`spec.md`) focusing on Functional Scope, Data Model, UX Flow, Edge Cases, Non-Functional, and External Integration based on the provided template data.
4.  **Strategy Update:** Call `update_topic` to inform the user of the planned specification structure.

### Phase 4: Execution & Implementation

**Goal:** Draft the formal feature specification.

1.  **Execution Update:** Call `update_topic` to indicate the specification drafting has begun.
2.  **Step 3 (Formalization):** Use `write_file` or `replace` to create or update `./specs/spec.md`. All intermediate and final design artifacts MUST be stored strictly in the `./specs/` directory.
3.  **Highlight Ambiguities:** Use `[NEEDS CLARIFICATION]` markers for unclear aspects that were missing or ambiguous in the `feature-request.md`.

### Phase 5: Validation & Finalization

**Goal:** Ensure completeness and trigger the next step.

1.  **Verify Structure:** Read the written `./specs/spec.md` to ensure all sections are present.
2.  **Final Update:** Call `update_topic` to recap the completion of the specification.
3.  **Next Steps:** Suggest running the Clarify workflow to resolve any `[NEEDS CLARIFICATION]` markers.
