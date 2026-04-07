---
description: Execute the implementation plan by processing all tasks defined in tasks.md for this Vite + React SPA project.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse FEATURE_DIR and AVAILABLE_DOCS. All paths must be absolute.

2. Check checklists status (if FEATURE_DIR/checklists/ exists). For each checklist, count total/completed/incomplete items. If any incomplete: STOP and ask user for confirmation. If all complete: proceed.

3. Load implementation context:
   - **Required**: tasks.md (task list), plan.md (tech stack, architecture)
   - **Optional**: data-model.md, contracts/, research.md

4. Verify project conventions before each task (Vite + React SPA):
   - Pages: `src/page/{PageName}/` with local `components/` and `hooks/`
   - API: Axios via `src/apis/primitives.ts`, functions in `src/apis/apis/`, types in `requests/` + `responses/`
   - Hooks: `src/hooks/query/` for TanStack Query, `src/hooks/mutations/` for mutations
   - Components: function declaration style (`export default function Component() {}`)
   - i18n: `useTranslation()` for all user-facing text
   - Variables: `const` by default, `let` only for reassignment, NEVER `var`
   - Naming: Components PascalCase, hooks `use` prefix camelCase, utils camelCase

5. Parse tasks.md structure: extract phases, dependencies, parallel markers [P].

6. Execute phase-by-phase:
   - Complete each phase before moving to the next
   - Respect dependencies: sequential tasks in order, parallel [P] tasks can run together
   - File-based coordination: tasks affecting same files run sequentially

7. Track progress: report after each completed task, mark as `- [x]` in tasks.md. Halt on non-parallel task failure.

8. Validate completion: verify all tasks completed, features match spec, tests pass, project conventions followed. Report final status.
