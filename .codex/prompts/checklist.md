Generate a custom checklist for the current feature — "unit tests for requirements writing."

Checklists validate the QUALITY of requirements (completeness, clarity, consistency, measurability), NOT implementation behavior.

## Steps

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` to get FEATURE_DIR
2. Ask up to 3 clarifying questions about scope, depth, audience
3. Load spec.md, plan.md (if exists), tasks.md (if exists)
4. Generate checklist items grouped by: Completeness, Clarity, Consistency, Acceptance Criteria, Scenario Coverage, Edge Cases, Non-Functional, Dependencies
5. Write to `FEATURE_DIR/checklists/{domain}.md` (e.g., `ux.md`, `api.md`, `security.md`)

## Item Format

- Items ask about REQUIREMENT QUALITY, not implementation:
  - YES: "Are error handling requirements defined for all API failure modes? [Gap]"
  - NO: "Verify the button clicks correctly"
- Include traceability: `[Spec §X.Y]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`
- Sequential IDs: CHK001, CHK002, ...

## Context

- Full workflow details: `.claude/commands/speckits/checklist.md`
