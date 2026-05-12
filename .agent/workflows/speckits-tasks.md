---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on spec, plan, and design artifacts.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute.

2. Load design documents from FEATURE_DIR:
   - **Required**: plan.md (tech stack, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions)

3. Execute task generation:
   - Extract tech stack and libraries from plan.md
   - Extract user stories with priorities (P1, P2, P3) from spec.md
   - If data-model.md exists: map entities to user stories
   - If contracts/ exists: map endpoints to user stories
   - Generate tasks organized by user story
   - Validate task completeness (each user story independently testable)

4. Generate tasks.md using `.specify/templates/tasks-template.md` structure. Every task MUST follow the format: `- [ ] T001 [P] [US1] Description with file path`.

5. Organize by phases:
   - **Phase 1**: Setup (project initialization)
   - **Phase 2**: Foundational (blocking prerequisites)
   - **Phase 3+**: One phase per user story in priority order. Within each: Types → Utils → API → Hooks → Components → Page
   - **Final Phase**: Polish & cross-cutting concerns

6. Project path conventions for this Vite + React SPA:
   - `src/page/{PageName}/` — Pages with local components/ and hooks/
   - `src/components/{Component}/` — Reusable UI components
   - `src/hooks/query/` — TanStack Query hooks, `src/hooks/mutations/` — Mutation hooks
   - `src/apis/apis/` — API functions, `src/apis/requests/` + `responses/` — Types
   - `src/util/`, `src/constants/`, `src/type/`, `src/repositories/`
   - `src/mocks/handlers/` — MSW handlers

7. Report: output path to tasks.md, total task count, count per user story, parallel opportunities, suggested MVP scope. Suggest next: `/speckits-analyze` or `/speckits-implement`.
