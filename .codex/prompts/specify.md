Create or update a feature specification with GitHub issue tracking and auto-clarification.

## Steps

1. Generate a kebab-case slug for the feature (2-4 words)
2. Set up GitHub issue via `gh` CLI (create new or use existing)
3. Create feature branch: `feat/#{ISSUE_NUMBER}-{SLUG}`
4. Run `.specify/scripts/bash/create-new-feature.sh --json --no-branch --type-prefix feat --number {ISSUE_NUMBER} --short-name "{SLUG}" --issue-number {ISSUE_NUMBER} "{DESCRIPTION}"` to scaffold spec directory
5. Write specification using `.specify/templates/spec-template.md` template
6. Run auto-clarification loop (max 5 questions)
7. Generate quality checklist at `FEATURE_DIR/checklists/requirements.md`

## Context

- Full workflow details: `.claude/commands/speckits/specify.md`
- Constitution: `.specify/memory/constitution.md`
- Project: debate-timer-fe (React 18 + Vite + TypeScript)
