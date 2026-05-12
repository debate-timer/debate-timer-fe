Execute the TDD-driven implementation planning workflow to generate design artifacts including test contracts.

## Steps

1. Run `.specify/scripts/bash/setup-plan.sh --json` to get FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH
2. Read spec, constitution (`.specify/memory/constitution.md`), and IMPL_PLAN template
3. Explore codebase: `src/page/`, `src/components/`, `src/hooks/`, `src/apis/`, `src/util/`, existing tests
4. Fill Technical Context: React 18 + Vite, Axios, TanStack Query 5, Tailwind CSS 3, Vitest + MSW, TDD approach
5. Run consistency check against project conventions
6. Phase 0: Research unknowns → `research.md`
7. Phase 1 (TDD-First): Data model → `data-model.md`, API contracts → `contracts/`, test contracts → `test-contracts/`
8. Design TDD implementation order: `util/` → `apis/` → `hooks/` → `components/` → `page/`
9. Architecture decision table with testability impact

## Context

- Full workflow details: `.claude/commands/speckits/plan.md`
- Test approach: Red-Green-Refactor, Korean test descriptions, Vitest globals, MSW for API mocking
- Next step: run tasks workflow
