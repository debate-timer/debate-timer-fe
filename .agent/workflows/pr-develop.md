---
description: Create a PR from current branch to develop branch with automated title and body based on GitHub issue and branch changes.
---

1. Parse the current branch name to extract the issue number (e.g., `design/#16` → issue number `16`).

2. Fetch issue information: `gh issue view {issue-number}` to get the issue title.

3. Generate PR title: combine branch name and issue title. Format: `{branch-name} {issue-title-without-prefix}`. Remove category prefix like `[DESIGN]` from the issue title.

4. Analyze branch changes: run `git log develop...HEAD` and `git diff develop...HEAD` to understand the work done.

5. Generate PR body using `.github/PULL_REQUEST_TEMPLATE.md`:
   - Fill `closed #{issue-number}` in the related issue section
   - Summarize branch changes in the work description section
   - Keep review requirements section empty

6. Push current branch to remote if not already pushed.

7. Create PR: `gh pr create --base develop --title "{title}" --body "{body}"` using heredoc for multi-line body.

8. Output the created PR URL to the user.
