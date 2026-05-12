Identify underspecified areas in the current feature spec by asking up to 5 targeted clarification questions and encoding answers back into the spec.

## Steps

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` to get FEATURE_DIR and FEATURE_SPEC
2. Load and scan the spec across categories: Functional Scope, Data Model, UX Flow, Edge Cases, Non-Functional, External Integration
3. Generate max 5 prioritized clarification questions (one at a time, multiple-choice or short answer)
4. After each answer, update the spec inline and record in `## Clarifications` section
5. Report coverage summary

## Context

- Full workflow details: `.claude/commands/speckits/clarify.md`
- Next step after completion: run plan workflow
