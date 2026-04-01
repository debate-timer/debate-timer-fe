---
description: Execute the TDD-driven implementation planning workflow to generate design artifacts including test contracts for a Vite + React SPA project.
---

1. Run `.specify/scripts/bash/setup-plan.sh --json` from repo root. Parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH.

2. Load context: read FEATURE_SPEC (spec.md), `.specify/memory/constitution.md`, `CLAUDE.md` or project rules if they exist, IMPL_PLAN template, and `package.json`.

3. Explore the existing codebase before planning:
   - Scan `src/page/` for page structure patterns
   - Check `src/components/`, `src/hooks/` (query/, mutations/), `src/apis/`
   - Check `src/util/`, `src/constants/`, `src/repositories/`
   - Review 1-2 existing pages for patterns (TanStack Query hooks, Axios API functions, compound components)
   - Scan existing `*.test.ts(x)` files for test patterns (Vitest, @testing-library/react, MSW, Korean descriptions)

4. Fill Technical Context in the plan:
   - TypeScript (strict), React 18 + Vite, React Router v7, TanStack React Query 5
   - Axios (custom `request<T>` primitive), Tailwind CSS 3, i18next, Framer Motion
   - Testing: Vitest + @testing-library/react + userEvent + MSW
   - Test approach: **TDD (Red-Green-Refactor)**

5. Run Constitution & Consistency Check from `.specify/memory/constitution.md`: verify folder structure, API layer patterns, hooks separation, page structure, no circular dependencies.

6. Phase 0 — Research: extract unknowns, research each, write findings to `research.md`.

7. Phase 1 — Design & Contracts (TDD-First):
   - Extract entities → `data-model.md`
   - Generate API contracts → `contracts/`
   - Define project structure with test files (co-located `{module}.test.ts(x)`)
   - Write test contracts to `test-contracts/`: behavior list per module, expected I/O, boundary conditions
   - Test priority: `util/` → `apis/` (MSW) → `hooks/` → `components/` → `page/`

8. Define TDD Implementation Order (Red-Green-Refactor cycle):
   - Types (`type/`, `apis/requests/`, `apis/responses/`)
   - Pure utilities (`util/`)
   - MSW handlers (`mocks/handlers/`)
   - API functions (`apis/apis/`)
   - Query/Mutation hooks (`hooks/query/`, `hooks/mutations/`)
   - Page/component hooks → UI components → Page components

9. Create Architecture Decision Table: decision name, options, chosen option with rationale, impact, testability impact.

10. Report: branch, spec path, IMPL_PLAN path, generated artifacts, TDD order summary, constitution check status. Suggest next: `/speckits-tasks`.
