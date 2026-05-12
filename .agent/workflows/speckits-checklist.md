---
description: Generate a custom requirements quality checklist — unit tests for requirements writing, validating completeness, clarity, and consistency.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root. Parse JSON for FEATURE_DIR and AVAILABLE_DOCS.

2. Ask up to 3 clarifying questions about scope, depth, and audience. Generate questions dynamically from feature domain keywords, risk indicators, and stakeholder hints. Skip if already clear from user input.

3. Load feature context from FEATURE_DIR: spec.md (requirements/scope), plan.md (technical details), tasks.md (implementation tasks). Load only portions relevant to focus areas.

4. Generate checklist — "Unit Tests for Requirements":
   - Create `FEATURE_DIR/checklists/` directory if needed
   - Use short descriptive filename based on domain (e.g., `ux.md`, `api.md`, `security.md`)
   - Sequential IDs: CHK001, CHK002, ...
   - Each run creates a NEW file (never overwrites existing checklists)

5. Checklist items must test REQUIREMENT QUALITY, not implementation:
   - **Completeness**: "Are all necessary requirements documented?"
   - **Clarity**: "Are requirements specific and unambiguous?"
   - **Consistency**: "Do requirements align without conflicts?"
   - **Measurability**: "Can requirements be objectively verified?"
   - **Coverage**: "Are all scenarios/edge cases addressed?"
   - Include traceability: `[Spec §X.Y]`, `[Gap]`, `[Ambiguity]`, `[Conflict]`
   - Minimum 80% of items must include traceability references

6. PROHIBITED patterns (these test implementation, not requirements):
   - "Verify the button clicks correctly"
   - "Test error handling works"
   - Any item starting with "Verify", "Test", "Confirm" + implementation behavior

7. REQUIRED patterns (these test requirements quality):
   - "Are [requirement type] defined/specified for [scenario]?"
   - "Is [vague term] quantified with specific criteria?"
   - "Are requirements consistent between [section A] and [section B]?"

8. Follow template structure from `.specify/templates/checklist-template.md` if available. Report: output path, item count, focus areas, depth level.
