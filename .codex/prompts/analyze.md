Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md.

## Steps

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` to get paths
2. Load spec.md, plan.md, tasks.md, and `.specify/memory/constitution.md`
3. Build semantic models: requirements inventory, user story inventory, task coverage mapping
4. Run detection passes: Duplication, Ambiguity, Underspecification, Constitution Alignment, Coverage Gaps, Inconsistency
5. Assign severity: CRITICAL / HIGH / MEDIUM / LOW
6. Output analysis report with coverage summary table and next actions

## Rules

- STRICTLY READ-ONLY: Do NOT modify any files
- Constitution violations are always CRITICAL
- Limit to 50 findings total

## Context

- Full workflow details: `.claude/commands/speckits/analyze.md`
