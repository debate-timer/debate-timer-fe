---
description: Create or update the project constitution at .specify/memory/constitution.md from interactive or provided principle inputs, keeping dependent templates in sync.
---

1. Load the existing constitution at `.specify/memory/constitution.md`. Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.

2. Collect/derive values for placeholders:
   - Use values from user input if supplied
   - Otherwise infer from repo context (README, docs, prior constitution)
   - `RATIFICATION_DATE`: original adoption date
   - `LAST_AMENDED_DATE`: today if changes are made
   - `CONSTITUTION_VERSION`: increment with semver (MAJOR: principle removals/redefinitions, MINOR: new principles added, PATCH: clarifications/typos)

3. Draft the updated constitution:
   - Replace every placeholder with concrete text (no bracketed tokens left)
   - Preserve heading hierarchy
   - Each Principle section: succinct name, non-negotiable rules, explicit rationale

4. Consistency propagation: read and verify alignment with:
   - `.specify/templates/plan-template.md` (Constitution Check section)
   - `.specify/templates/spec-template.md` (scope/requirements alignment)
   - `.specify/templates/tasks-template.md` (task categorization)
   - Command files in `.specify/templates/commands/*.md`
   - Runtime docs (README.md, quickstart.md)

5. Produce a Sync Impact Report (prepend as HTML comment in constitution file):
   - Version change: old → new
   - Modified/added/removed principles
   - Templates requiring updates (with file paths)

6. Validate: no unexplained bracket tokens, version matches report, dates in ISO format, principles are declarative and testable.

7. Write completed constitution to `.specify/memory/constitution.md`.

8. Output summary: new version, bump rationale, files flagged for follow-up, suggested commit message.
