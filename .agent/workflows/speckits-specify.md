---
description: Create or update a feature specification with GitHub issue tracking, branch setup, and auto-clarification loop.
---

1. Read `README.md` for project overview and domain context (debate timer service).

2. Generate a concise slug (2-4 words, kebab-case) from the feature description. Use action-noun format (e.g., "social-login", "vote-results-calendar").

3. Ask user which TYPE of work this is: feat / fix / design / docs / refactor / chore / config / test / style / hotfix. Use the selection as `{TYPE}` (lowercase) and `{TYPE_UPPER}` (uppercase) throughout.

4. Verify `gh` CLI is authenticated (`gh auth status`). Ask user whether to create a new GitHub issue or use an existing one. If new, run `gh issue create --title "[{TYPE_UPPER}] {SLUG}" --body "..." --label "{TYPE}"`. If existing, verify with `gh issue view`.

5. Ask user which base branch to use: current branch or `develop` (recommended). Create feature branch: `git checkout -b "{TYPE}/#{ISSUE_NUMBER}-{SLUG}"`.

6. Run `.specify/scripts/bash/create-new-feature.sh --json --no-branch --type-prefix {TYPE} --number {ISSUE_NUMBER} --short-name "{SLUG}" --issue-number {ISSUE_NUMBER} "{FEATURE_DESCRIPTION}"` to create spec directory structure. Parse JSON output for SPEC_FILE, FEATURE_DIR, FEATURE_NUM.

7. Load `.specify/templates/spec-template.md`. Write the specification to SPEC_FILE following the template structure. Focus on WHAT users need and WHY — avoid implementation details. Make informed guesses for unclear aspects, document assumptions, limit to max 3 `[NEEDS CLARIFICATION]` markers.

8. Run auto-clarification loop: scan spec across 6 categories (Functional Scope, Data Model, UX Flow, Edge Cases, Non-Functional, External Integration). Generate max 5 questions for Partial/Missing categories. Present one question at a time, update spec inline after each answer.

9. Generate quality validation checklist at `FEATURE_DIR/checklists/requirements.md`.

10. Report completion with spec path, GitHub issue link, branch name, clarification summary, and suggest next step: run `/speckits-plan`.
