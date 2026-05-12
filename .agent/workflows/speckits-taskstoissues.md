---
description: Convert existing tasks from tasks.md into actionable, dependency-ordered GitHub issues for the feature.
---

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root. Parse FEATURE_DIR and AVAILABLE_DOCS. All paths must be absolute.

2. Extract the path to tasks.md from the script output. Load and parse all tasks.

3. Get the Git remote: `git config --get remote.origin.url`. **ONLY proceed if the remote is a GitHub URL.**

4. For each task in the list, create a GitHub issue in the repository matching the Git remote. Include task ID, description, dependencies, and phase information.

**CAUTION**: Under no circumstances create issues in repositories that do not match the remote URL.
