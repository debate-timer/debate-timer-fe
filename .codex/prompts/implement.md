Execute the implementation plan by processing and executing all tasks defined in tasks.md.

## Steps

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` to get paths
2. Check checklists status (if FEATURE_DIR/checklists/ exists). Stop if incomplete.
3. Load tasks.md, plan.md, and optional artifacts (data-model.md, contracts/, research.md)
4. Verify project conventions before each task:
   - Pages: `src/page/{PageName}/` with local `components/` + `hooks/`
   - API: Axios via `src/apis/primitives.ts`
   - Hooks: `src/hooks/query/` + `src/hooks/mutations/`
   - Components: function declaration style
   - i18n: `useTranslation()` for all user-facing text
5. Execute phase by phase, respecting dependencies and [P] parallel markers
6. Mark completed tasks as `- [x]` in tasks.md
7. Validate completion against specification

## Context

- Full workflow details: `.claude/commands/speckits/implement.md`
