Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.

## Steps

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` to get FEATURE_DIR and AVAILABLE_DOCS
2. Load: plan.md (required), spec.md (required), data-model.md, contracts/, research.md (optional)
3. Extract tech stack, user stories with priorities, entities, endpoints, decisions
4. Generate tasks organized by user story using `.specify/templates/tasks-template.md`
5. Task format: `- [ ] T001 [P] [US1] Description with file path`

## Task Phases

- Phase 1: Setup (project initialization)
- Phase 2: Foundational (blocking prerequisites)
- Phase 3+: User Stories in priority order (Types → Utils → API → Hooks → Components → Page)
- Final: Polish & cross-cutting concerns

## Project Paths

- `src/page/{PageName}/` — Pages with local components/ and hooks/
- `src/hooks/query/` / `src/hooks/mutations/` — TanStack Query hooks
- `src/apis/apis/` — API functions, `src/apis/requests/` + `responses/` — Types
- `src/components/` — Reusable components
- `src/mocks/handlers/` — MSW handlers

## Context

- Full workflow details: `.claude/commands/speckits/tasks.md`
- Next step: run analyze or implement workflow
