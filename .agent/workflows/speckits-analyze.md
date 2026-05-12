---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse JSON for FEATURE_DIR. Derive paths: SPEC, PLAN, TASKS. Abort if any required file is missing.

2. Load artifacts progressively:
   - **spec.md**: Overview, Functional/Non-Functional Requirements, User Stories, Edge Cases
   - **plan.md**: Architecture/stack, Data Model, Phases, Technical constraints
   - **tasks.md**: Task IDs, Descriptions, Phase grouping, Parallel markers, File paths
   - **constitution**: `.specify/memory/constitution.md` for principle validation

3. Build semantic models (internal, not output):
   - Requirements inventory with stable keys
   - User story/action inventory with acceptance criteria
   - Task coverage mapping (each task → requirements/stories)
   - Constitution rule set (MUST/SHOULD normative statements)

4. Run detection passes (limit 50 findings total):
   - **Duplication**: near-duplicate requirements
   - **Ambiguity**: vague adjectives lacking measurable criteria, unresolved placeholders
   - **Underspecification**: requirements missing outcomes, stories missing acceptance criteria
   - **Constitution Alignment**: conflicts with MUST principles (always CRITICAL)
   - **Coverage Gaps**: requirements with zero tasks, tasks with no mapped requirement
   - **Inconsistency**: terminology drift, entity mismatches, task ordering contradictions

5. Assign severity: CRITICAL (constitution violations, missing core artifacts) / HIGH (conflicts, ambiguous security/performance) / MEDIUM (terminology drift, missing coverage) / LOW (style improvements).

6. Produce Markdown analysis report with findings table, coverage summary, constitution alignment issues, unmapped tasks, and metrics (total requirements, total tasks, coverage %, ambiguity count, critical issues count).

7. Provide next actions: if CRITICAL issues exist, recommend resolving before implementation. If only LOW/MEDIUM, user may proceed. Offer to suggest concrete remediation edits (do NOT apply automatically).

**IMPORTANT**: This is STRICTLY READ-ONLY. Do NOT modify any files.
