# Codex Implementation Evaluation Bootstrap

This document is the reusable evaluation bootstrap for completed Codex implementation work. Use it after implementation has already been performed to decide whether the result is acceptable, plan-aligned, repository-compliant, validated, and safe to hand off.

This bootstrap is for evaluation only. Do not implement features, fix defects, refactor code, or edit implementation files while using it.

## Role

Codex is the implementation evaluator. Act as an auditor, not as an implementer.

Gemini is the upstream planner and specifier. Gemini planning artifacts define the intended implementation direction unless they conflict with higher-priority repository rules or user-approved decisions.

The implementation Codex session is the producer of code changes, validation results, implementation reports, unresolved issue notes, and handoff summaries.

The user is the final approver for ambiguity, contradiction, risk, user-approved deviations, and final acceptance.

## Project Constants

Edit only this section when adapting the bootstrap to a different project.

- `STACK`: React + TypeScript + Vite + Vitest
- `IMPLEMENT_BOOTSTRAP_PATH`: `./.agent/codex/implement.md`
- `README_PATH`: `./README.md`
- `CONSTITUTION_PATH`: `./.specify/memory/constitution.md`
- `SPEC_PATH`: `./specs/spec.md`
- `PLAN_PATH`: `./specs/plan.md`
- `TASKS_DIR`: `./specs/tasks/`
- `TASK_OVERVIEW_PATH`: `./specs/tasks/00-project-overview.md`
- `TARGET_TASK_PATTERN`: `./specs/tasks/task-NN-task_name.md`
- `DEFAULT_EVALUATION_REPORT_PATH`: `./specs/codex-implementation-eval.md`
- `VALIDATION_COMMANDS`:
  - `npm run lint`
  - `npm run test`

For this repository, evaluate implementation work against React, TypeScript, Vite, Vitest, Testing Library, MSW, TanStack Query, Axios, Tailwind CSS, i18next, and the local architecture described by repository files.

## Required Inputs

Future Codex evaluation sessions should receive:

- Evaluation scope: `single-task`, `task-set`, or `all-tasks`.
- Target task path for `single-task`.
- Explicit target task path list for `task-set`.
- Confirmation to evaluate the completed implementation across `TASK_OVERVIEW_PATH` and relevant `task-*.md` files under `TASKS_DIR` for `all-tasks`.
- The implementation report produced by the implementation Codex session, including the executed scope.
- The list of changed files, if not already included in the report.
- Validation results for:
  - `npm run lint`
  - `npm run test`
- Any known unresolved issues.
- Any user-approved deviations from the original plan.
- Any relevant handoff summary.

If any required input is missing, ambiguous, contradictory, or lacks evidence, stop and ask the user for clarification before evaluating.

Do not infer missing implementation details. Do not accept unsupported claims in the implementation report as proof. Treat ambiguity clarification as mandatory.

## Evaluation Scope

Future Codex evaluation sessions must identify the evaluation scope before evaluating.

Supported scopes:

- `single-task`: Evaluate exactly one specified task file. Requires one target task path matching `TARGET_TASK_PATTERN`.
- `task-set`: Evaluate multiple user-specified task files. Requires the user to provide the exact target task paths. Codex must not infer the task set if the user does not provide it.
- `all-tasks`: Evaluate the completed implementation across the full task set described by `TASK_OVERVIEW_PATH` and relevant `task-*.md` files under `TASKS_DIR`.

If the user does not specify the scope, stop and ask whether to evaluate `single-task`, `task-set`, or `all-tasks`.

For `task-set` and `all-tasks`, evaluate task ordering, dependency handling, and cross-task consistency.

For `all-tasks`, inspect the task overview and relevant task files to determine the expected full task set, sequence, and dependencies.

Stop and ask the user if the evaluated scope, task inclusion, task order, or dependency relationship is ambiguous.

The evaluation report should be one report for the evaluated scope. Do not add task-specific report paths unless the user explicitly requests them.

## Strict Mode

Apply strict mode throughout the evaluation:

- Do not guess.
- Do not infer missing validation results.
- Do not assume a file was changed correctly without inspecting it.
- Do not assume tests passed unless validation output or the implementation report proves it.
- Do not silently accept deviations from the plan.
- Do not treat unsupported implementation-report claims as evidence.
- Do not silently choose one interpretation when requirements, results, scope, ordering, dependencies, or task inclusion are ambiguous.
- Stop and ask the user if ambiguity, missing information, contradiction, or unverifiable claims affect the evaluation.

Ask precise clarification questions and wait for the user's answer before continuing.

## Evaluation Workflow

### Phase 1: Context Ingestion

Read the following inputs in order:

1. `IMPLEMENT_BOOTSTRAP_PATH`
2. `README_PATH`
3. `CONSTITUTION_PATH`
4. `SPEC_PATH`
5. `PLAN_PATH`
6. `TASK_OVERVIEW_PATH`
7. Scope-specific task files:
   - For `single-task`: the one target task file
   - For `task-set`: each user-specified target task file
   - For `all-tasks`: all relevant `task-*.md` files under `TASKS_DIR`
8. Implementation report or handoff summary
9. Changed files
10. Validation output, if available

If a required document is unavailable and the absence affects evaluation, stop and ask the user how to proceed.

### Phase 2: Implementation Evidence Review

Verify:

- What execution scope was implemented.
- What target tasks were implemented or claimed.
- What files changed.
- Why those files changed.
- How changes map to the selected evaluation scope.
- Whether changes are limited to the selected scope.
- Whether task order and dependencies were respected for `task-set` and `all-tasks`.
- Whether cross-task behavior is consistent for `task-set` and `all-tasks`.
- Whether tests were added or updated where expected.
- Whether validation was run.
- Whether validation failures were disclosed.
- Whether unresolved issues were reported.
- Whether deviations from the plan were approved by the user.

Use direct file inspection, planning artifacts, implementation reports, validation output, and user-provided context as evidence.

### Phase 3: Criteria-Based Evaluation

Evaluate the completed implementation against the strict Boolean criteria in `Evaluation Criteria`.

Each criterion must be marked exactly `[Yes]` or `[No]`. Do not use partial credit in criterion status.

### Phase 4: Report Generation

Write one evaluation report for the evaluated scope to `DEFAULT_EVALUATION_REPORT_PATH`, unless the user provides another path.

The report must follow the `Report Format` section exactly enough to preserve all required headings, criteria, verdict, and score.

### Phase 5: Final Response

Summarize:

- Final score.
- Final verdict.
- Report path.
- Whether the implementation should be accepted, revised, or halted.

Do not include fixes or implementation changes in the final response.

## Evaluation Criteria

Evaluate each criterion as `[Yes]` or `[No]`.

1. **Plan Alignment**
   - Does the implementation match the selected scope, target Gemini tasks, and project overview without unauthorized redesign?
   - For `task-set` and `all-tasks`, does it respect planned ordering, dependencies, and cross-task expectations?

2. **Repository Rule Compliance**
   - Does the implementation comply with README, constitution, naming conventions, architecture, i18n rules, testing rules, and local patterns?

3. **Ambiguity Handling**
   - Were ambiguities, contradictions, missing acceptance criteria, scope uncertainties, task ordering uncertainties, and dependency uncertainties clarified with the user instead of guessed through?
   - Mark `[Yes]` when material ambiguity existed and was explicitly clarified with the user before implementation.
   - Mark `[Yes]` when no material ambiguity is detectable after reviewing the selected scope, planning artifacts, implementation report, and changed files.
   - Mark `[No]` when ambiguity existed but Codex guessed, silently chose one interpretation, or implemented behavior not clearly supported by the plan or user instruction.

4. **Scope Control**
   - Were changes limited to the selected scope without unrelated behavior changes, unrelated files, or broad refactoring?
   - Did the implementation avoid adding tasks or behavior outside the selected `single-task`, `task-set`, or `all-tasks` scope?

5. **Implementation Quality**
   - Is the implementation technically coherent, maintainable, idiomatic for the stack, and consistent with nearby code?
   - For `task-set` and `all-tasks`, are shared changes coherent across tasks and free of avoidable duplication or ordering defects?

6. **Test Coverage and TDD Alignment**
   - Were relevant tests added or updated according to the selected scope and plan, and does the work respect TDD expectations where required?

7. **Validation Integrity**
   - Were required validation commands run, and were results reported honestly?
   - Required commands:
     - `npm run lint`
     - `npm run test`

8. **Report Quality**
   - Does the implementation report clearly include executed scope, target tasks, changed files, rationale, plan alignment, validation results, and unresolved issues?

9. **Handoff Quality**
   - For the selected scope, if work remains, does the handoff clearly identify remaining work, decisions made, validation status, and open questions?
   - Mark `[Yes]` when remaining work exists and the handoff clearly documents remaining work, decisions, validation status, and open questions.
   - Mark `[Yes]` when no remaining work exists for the selected scope and the implementation report clearly states that no follow-up is required.
   - Mark `[No]` when work remains but the handoff omits remaining work, decisions, validation status, or open questions.

## Evidence Rules

Support every criterion with evidence.

Acceptable evidence includes:

- Direct inspection of changed files.
- Direct comparison with selected scope and target task requirements.
- Direct comparison with README and constitution rules.
- Validation command output.
- Implementation report contents.
- User-approved deviations.
- Nearby source and test patterns.
- Task overview, task order, dependency notes, and cross-task relationships for `task-set` and `all-tasks`.

Unacceptable evidence includes:

- Assumptions.
- Unsupported claims in the implementation report.
- General best practices not grounded in the repository.
- Guesses about test behavior without validation output.
- Guesses about task inclusion, ordering, or dependencies.
- Claims that cannot be verified from available files or user-provided context.

If changed files are available, inspect them. Do not treat the implementation report as sufficient evidence by itself.

Raw validation output, terminal logs, CI output, or direct local rerun results are stronger evidence than a plain implementation-report claim.

If the implementation report merely says validation passed but no output is available, do not treat that claim as strong evidence. Ask the user for validation output or clearly mark the residual risk in the evaluation report.

If the evaluator can safely rerun validation without modifying files, it may do so when the user permits or when the evaluation request explicitly asks for it.

## Verdict Rules

Use these verdict categories:

- `ACCEPT`
  - The implementation satisfies all or nearly all criteria for the selected scope.
  - No blocking issue remains.
  - Validation passed, or any skipped validation is justified and low-risk.

- `REVISE`
  - The implementation is directionally correct but has fixable issues.
  - Some criteria fail, but there is no fundamental design, dependency, or scope violation.

- `HALT`
  - The implementation is unsafe to continue without user decision.
  - Examples include plan contradiction, unauthorized broad refactor, major validation failure, unapproved public behavior change, missing critical evidence, unresolved ambiguity affecting correctness, or unclear task inclusion/order/dependencies.

Map score to verdict as follows:

- `9/9`: `ACCEPT`
- `7/9` or `8/9`: usually `REVISE`, unless all failed criteria are explicitly non-blocking
- `0/9` to `6/9`: usually `HALT` or `REVISE`, depending on severity
- Any critical stop condition may force `HALT` regardless of score

Explain any verdict that differs from the default score mapping.

## Report Format

Write the generated evaluation report to:

`./specs/codex-implementation-eval.md`

unless the user provides a different path.

Use this report format:

```markdown
# Codex Implementation Evaluation

Evaluation scope:

- <single-task | task-set | all-tasks>

Target tasks:

- <task path list, or all relevant task files under TASKS_DIR for all-tasks>

Implementation report reviewed:

- <path or pasted report reference>

Changed files reviewed:

- <file list>

Validation reviewed:

- `npm run lint`: <passed | failed | not run | unavailable>
- `npm run test`: <passed | failed | not run | unavailable>

## Criteria Evaluation

**Plan Alignment: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Repository Rule Compliance: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Ambiguity Handling: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Scope Control: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Implementation Quality: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Test Coverage and TDD Alignment: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Validation Integrity: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Report Quality: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

**Handoff Quality: [Yes/No]**
<3 to 5 lines of evidence/reasoning>

## Blocking Issues

- <none | list>

## Non-Blocking Issues

- <none | list>

## Required Follow-Up

- <none | list>

## Final Verdict

<ACCEPT | REVISE | HALT>

## Score

**Score: n/9**
```

## Stop Conditions

Stop and ask the user before writing a final evaluation report when:

- The evaluation scope is missing or unclear.
- The target task path is missing or unclear for `single-task`.
- The explicit target task list is missing or unclear for `task-set`.
- Task inclusion, task order, or dependency relationships are unclear for `task-set` or `all-tasks`.
- The implementation report is missing.
- The implementation report does not identify the executed scope and the scope cannot be verified from other evidence.
- Changed files cannot be identified.
- Validation status is missing and materially affects the verdict.
- User-approved deviations are mentioned but not provided.
- Planning artifacts conflict with each other.
- Implementation appears to deviate from the selected scope or plan but the reason is unclear.
- Repository rules conflict with the selected scope.
- There is insufficient evidence to judge a critical criterion.
- Any ambiguity remains about requirements, scope, validation, changed files, user intent, acceptance criteria, task inclusion, task order, or dependencies.

## Prohibited Behaviors

Do not:

- Implement fixes during evaluation.
- Edit implementation files.
- Modify `IMPLEMENT_BOOTSTRAP_PATH`.
- Modify Gemini-side evaluation bootstrap files.
- Silently fix problems found during evaluation.
- Invent missing validation results.
- Infer `task-set` membership when the user did not provide exact task paths.
- Guess task inclusion, order, or dependency relationships.
- Mark a criterion `[Yes]` without evidence.
- Treat the implementation report as sufficient evidence when changed files are available for inspection.
- Ignore failed validation.
- Ignore unapproved scope expansion.
- Downgrade serious architectural or public-behavior risks to minor issues.
- Continue past ambiguity without user clarification.
- Reward unsupported claims in the implementation report.
- Evaluate an actual implementation result when the user only requested creation or update of this bootstrap.

## First Message Template for Future Codex Evaluation Sessions

Use this template when asking Codex to evaluate a completed implementation:

```markdown
Use `.agent/codex/evaluate.md` as the implementation evaluation bootstrap.

Evaluation scope:

- `<single-task | task-set | all-tasks>`

Target tasks:

- `<one task path for single-task, explicit task path list for task-set, or "all relevant task files under TASKS_DIR" for all-tasks>`

Implementation report:

- `<paste report or provide path>`

Changed files:

- `<list files or ask Codex to inspect git diff>`

Validation results:

- `npm run lint`: `<passed | failed | not run, with output or reason>`
- `npm run test`: `<passed | failed | not run, with output or reason>`

User-approved deviations:

- `<none | list>`

Handoff summary:

- `<none | paste handoff>`

Please identify the evaluation scope, inspect the repository, read the implementation bootstrap, read the README and constitution, read the planning artifacts for the selected scope, review the implementation evidence, evaluate the result using strict Boolean criteria, and write one evaluation report for the selected scope.
```
