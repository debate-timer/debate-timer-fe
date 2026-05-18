# Codex 부트스트랩 사용법

## 1. 개요

이 문서는 Codex 작업을 안전하게 운영하기 위한 사용 가이드입니다.

이 저장소에는 두 가지 Codex 부트스트랩이 있습니다.

| 파일 | 용도 | 사용 시점 |
| --- | --- | --- |
| `./.agent/codex/implement.md` | Gemini가 만든 계획 문서를 기준으로 Codex가 구현을 수행하는 절차 정의 | 구현 전과 구현 중 |
| `./.agent/codex/evaluate.md` | Codex가 이미 완료한 구현 결과를 감사하고 평가하는 절차 정의 | 구현 완료 후 |

핵심 원칙은 간단합니다.

- 구현 세션은 코드를 바꾸는 세션입니다.
- 평가 세션은 구현 결과를 검토하는 세션입니다.
- 평가 세션에서는 구현 파일을 수정하면 안 됩니다.
- 파일 수정과 터미널 명령 실행은 명시적 사용자 승인이 필요합니다.

## 2. 파일 구성

`implement.md`는 Codex가 구현 작업을 시작할 때 따라야 하는 규칙입니다.

- README, constitution, spec, plan, task 문서를 읽는 순서
- scope 선택 방식
- 모호성 확인 방식
- 파일 수정 전 승인 방식
- 명령 실행 전 승인 방식
- 구현 단위 분해 방식
- 검증 명령어 처리 방식
- 구현 결과 보고 형식

`evaluate.md`는 Codex가 완료된 구현 결과를 평가할 때 따라야 하는 규칙입니다.

- 구현 report와 변경 파일 검토 방식
- 계획 문서와 실제 구현의 정합성 확인 방식
- 검증 결과의 증거 수준 판단 방식
- 9개 Boolean 평가 기준
- `ACCEPT`, `REVISE`, `HALT` verdict 산정 방식
- 평가 report 작성 형식

## 3. 구현 부트스트랩 사용 시점

`./.agent/codex/implement.md`는 Codex에게 구현을 맡기기 전에 사용합니다.

다음 상황에서 사용합니다.

- Gemini가 `spec.md`, `plan.md`, `tasks/` 문서를 만든 뒤 Codex가 실제 구현을 해야 할 때
- 특정 task 하나를 구현해야 할 때
- 여러 task를 순서대로 구현해야 할 때
- 전체 task set을 구현해야 할 때
- 구현 전에 scope, task 순서, 변경 파일, 실행할 명령어를 명확히 하고 싶을 때

구현 세션에서는 Codex가 파일을 만들거나 수정할 수 있으므로 승인 정책을 반드시 적용해야 합니다.

## 4. 평가 부트스트랩 사용 시점

`./.agent/codex/evaluate.md`는 구현이 이미 끝난 뒤 사용합니다.

다음 상황에서 사용합니다.

- Codex 구현 결과가 Gemini 계획과 맞는지 확인하고 싶을 때
- 변경 파일이 scope 밖으로 벗어나지 않았는지 확인하고 싶을 때
- validation 결과가 충분한 증거를 갖는지 확인하고 싶을 때
- 구현 report와 handoff가 충분한지 확인하고 싶을 때
- 최종적으로 `ACCEPT`, `REVISE`, `HALT` verdict를 받고 싶을 때

평가 세션은 감사 세션입니다. 구현 파일을 수정하거나 문제를 바로 고치면 안 됩니다.

## 5. Scope 선택법

Codex 작업을 시작할 때는 먼저 scope를 정해야 합니다.

| Scope | 의미 | 필요한 입력 |
| --- | --- | --- |
| `single-task` | 정확히 하나의 task 파일만 구현 또는 평가 | task 파일 1개 |
| `task-set` | 사용자가 지정한 여러 task 파일을 구현 또는 평가 | 정확한 task 파일 목록 |
| `all-tasks` | `TASK_OVERVIEW_PATH`와 `TASKS_DIR`의 관련 task 전체를 구현 또는 평가 | 전체 task set 사용 의사 |

scope가 불명확하면 Codex는 진행하지 않고 사용자에게 질문해야 합니다.

### 5.1 single-task

`single-task`는 정확히 하나의 task 파일만 다룹니다.

사용 예:

- 작은 기능 하나를 독립적으로 구현할 때
- 특정 task의 구현 결과만 평가할 때
- dependency가 거의 없거나 이미 해결된 task를 처리할 때

사용자는 task path를 하나만 제공해야 합니다.

예:

```md
./specs/tasks/task-03-add-login-modal.md
```

### 5.2 task-set

`task-set`은 사용자가 명시한 여러 task 파일만 다룹니다.

Codex가 task set을 추측하면 안 됩니다. 사용자가 정확한 task path 목록을 제공해야 합니다.

사용 예:

- 서로 연관된 2~3개 task를 한 번에 구현할 때
- API, hook, component처럼 dependency가 있는 task 묶음을 처리할 때
- 구현 결과를 여러 task 범위로 함께 평가할 때

`task-set`에서는 Codex가 task 순서와 dependency를 확인하고 구현 또는 평가 순서를 제안해야 합니다.

### 5.3 all-tasks

`all-tasks`는 전체 task set을 다룹니다.

Codex는 다음 문서를 기준으로 전체 범위를 파악합니다.

- `TASK_OVERVIEW_PATH`: `./specs/tasks/00-project-overview.md`
- `TASKS_DIR`: `./specs/tasks/`
- 관련 `task-*.md` 파일

사용 예:

- Gemini가 만든 전체 계획을 Codex가 끝까지 구현해야 할 때
- 완료된 전체 구현 결과를 한 번에 평가해야 할 때

`all-tasks`에서는 task 순서, dependency, 포함 범위가 모호하면 반드시 사용자에게 확인해야 합니다.

## 6. 권장 실행 흐름

권장 흐름은 다음과 같습니다.

1. Gemini가 specification, plan, tasks를 작성합니다.
2. 사용자가 Codex에게 `implement.md`를 사용해 구현을 요청합니다.
3. Codex가 scope를 확인합니다.
4. Codex가 필요한 문서와 task를 읽고 구현 순서를 제안합니다.
5. 사용자가 구현 단위, 예상 변경 파일, 실행 명령을 승인합니다.
6. Codex가 승인된 범위 안에서만 구현합니다.
7. Codex가 validation 명령 실행 승인을 요청합니다.
8. 사용자가 승인하면 Codex가 `npm run lint`, `npm run test`를 실행합니다.
9. Codex가 선택된 scope에 대한 evaluation-ready 구현 report 작성을 준비하고, `./specs/codex-implementation-report.md` 생성 또는 수정 승인을 요청합니다.
10. 사용자가 Codex에게 `evaluate.md`를 사용해 구현 결과 평가를 요청합니다.
11. Codex가 구현 report, 변경 파일, validation output, planning artifacts를 근거로 평가합니다.
12. Codex가 `./specs/codex-implementation-eval.md`에 평가 report를 작성합니다.

## 7. 승인 정책

`implement.md` 기준으로, future Codex 구현 세션은 파일 수정 전에 명시적 승인을 받아야 합니다.

승인이 필요한 파일 작업:

- 파일 생성
- 파일 편집
- 파일 삭제
- 파일 이동 또는 이름 변경
- 파일 포맷팅
- patch 적용
- repository 파일에 코드 생성

터미널 또는 shell 명령 실행도 명시적 승인이 필요합니다.

승인이 필요한 명령 예:

- `npm run lint`
- `npm run test`
- build 명령
- package-manager 명령
- git 명령
- migration 명령
- generator 명령
- formatting 명령
- `ls`, `find`, `grep`, `cat`, `rg`, `Get-Content` 같은 read-only shell 명령

Codex는 승인 요청 전에 다음을 제시해야 합니다.

- 수행할 inspection 또는 implementation 단위
- 수정할 것으로 예상되는 파일
- 실행하려는 명령
- 각 변경 또는 명령의 목적
- 예상 위험 또는 side effect

승인 하나가 이후의 모든 작업을 승인하는 것은 아닙니다. 승인된 batch 밖의 작업은 다시 승인을 받아야 합니다.

단, reasoning, planning, clarification question, 사용자가 직접 제공한 prompt text 읽기는 별도 승인이 필요하지 않습니다.

## 8. 검증 명령어 처리 방식

기본 validation 명령은 고정되어 있습니다.

```bash
npm run lint
npm run test
```

이 명령들은 기본적으로 필요하지만, 실행 전에는 반드시 사용자 승인이 필요합니다.

Codex는 validation 실행 전에 다음을 알려야 합니다.

- 실행할 정확한 명령
- 각 명령을 실행하는 이유
- 예상 runtime 또는 side effect
- cache, coverage, snapshot 등 생성 파일 가능성

평가 세션에서는 validation 결과를 증거로 봅니다. raw terminal output, CI output, local rerun output이 단순 report 문장보다 강한 증거입니다.

구현 report에 “validation passed”라고만 되어 있고 실제 output이 없으면, 평가 Codex는 사용자에게 output을 요청하거나 evaluation report에 residual risk를 명시해야 합니다.

## 9. 구현 호출 프롬프트 예시

### 9.1 single-task 구현 예시

```md
`.agent/codex/implement.md`를 구현 부트스트랩으로 사용해 주세요.

Execution scope:
- `single-task`

Target tasks:
- `./specs/tasks/task-03-example.md`

추가 제약:
- 계획 문서와 repository convention을 우선해 주세요.
- scope 밖 파일은 수정하지 마세요.

승인 지시:
- shell 명령은 실행 전에 먼저 요청해 주세요.
- 파일 수정은 예상 변경 파일과 목적을 설명한 뒤 승인받고 진행해 주세요.
- 승인된 batch 밖의 작업은 다시 승인받아 주세요.

Validation:
- 구현 후 `npm run lint`, `npm run test` 실행 승인을 요청해 주세요.

모호성 처리:
- task 요구사항, 파일 소유권, acceptance criteria, validation 기대값이 모호하면 추측하지 말고 질문한 뒤 대기해 주세요.
```

### 9.2 task-set 구현 예시

```md
`.agent/codex/implement.md`를 구현 부트스트랩으로 사용해 주세요.

Execution scope:
- `task-set`

Target tasks:
- `./specs/tasks/task-02-api-types.md`
- `./specs/tasks/task-03-query-hook.md`
- `./specs/tasks/task-04-page-integration.md`

추가 제약:
- 위에 명시한 task만 구현해 주세요.
- Codex가 task set을 임의로 추가하거나 추측하지 마세요.
- task 간 dependency와 구현 순서를 먼저 제안해 주세요.

승인 지시:
- repository inspection에 shell 명령이 필요하면 먼저 승인 요청해 주세요.
- 파일 수정 전 예상 변경 파일, 변경 목적, 위험을 설명해 주세요.
- 승인된 구현 batch만 수행해 주세요.

Validation:
- 구현 후 `npm run lint`, `npm run test` 실행 승인을 요청해 주세요.

모호성 처리:
- task 순서, dependency, 포함 범위, scope 밖 변경 여부가 모호하면 질문한 뒤 대기해 주세요.
```

### 9.3 all-tasks 구현 예시

```md
`.agent/codex/implement.md`를 구현 부트스트랩으로 사용해 주세요.

Execution scope:
- `all-tasks`

Target tasks:
- `TASK_OVERVIEW_PATH`와 `TASKS_DIR` 아래의 관련 `task-*.md` 전체

추가 제약:
- 전체 task set을 한 번의 실행 scope로 다뤄 주세요.
- task overview를 기준으로 task 포함 범위, 순서, dependency를 먼저 정리해 주세요.
- dependent task를 prerequisite보다 먼저 구현하지 마세요. 필요한 경우 먼저 승인 요청해 주세요.

승인 지시:
- shell 명령 실행 전 승인 요청해 주세요.
- 파일 수정 전 승인 요청해 주세요.
- 각 phase별로 승인된 batch만 진행해 주세요.

Validation:
- 구현 후 `npm run lint`, `npm run test` 실행 승인을 요청해 주세요.

모호성 처리:
- 전체 task 범위, task ordering, dependency, acceptance criteria가 모호하면 추측하지 말고 질문해 주세요.
```

## 10. 평가 호출 프롬프트 예시

### 10.1 single-task 평가 예시

```md
Use `.agent/codex/evaluate.md` as the implementation evaluation bootstrap.

Please answer in English for evaluation accuracy.

Evaluation scope:
- `single-task`

Target tasks:
- `./specs/tasks/task-03-example.md`

Implementation report:
- `./specs/codex-implementation-report.md`

Instructions:
- Do not modify implementation files during evaluation.
- Do not implement fixes during evaluation.
- If shell commands are needed, ask for approval before running them.
- If the implementation report is missing, incomplete, or inconsistent with changed files or validation evidence, stop and ask a precise clarification question.
```

### 10.2 task-set 평가 예시

```md
Use `.agent/codex/evaluate.md` as the implementation evaluation bootstrap.

Please answer in English for evaluation accuracy.

Evaluation scope:
- `task-set`

Target tasks:
- `./specs/tasks/task-02-api-types.md`
- `./specs/tasks/task-03-query-hook.md`
- `./specs/tasks/task-04-page-integration.md`

Implementation report:
- `./specs/codex-implementation-report.md`

Instructions:
- Do not modify implementation files during evaluation.
- Do not implement fixes during evaluation.
- If shell commands are needed, ask for approval before running them.
- If the implementation report is missing, incomplete, or inconsistent with changed files or validation evidence, stop and ask a precise clarification question.
```

### 10.3 all-tasks 평가 예시

```md
Use `.agent/codex/evaluate.md` as the implementation evaluation bootstrap.

Please answer in English for evaluation accuracy.

Evaluation scope:
- `all-tasks`

Target tasks:
- `TASK_OVERVIEW_PATH`와 `TASKS_DIR` 아래의 관련 `task-*.md` 전체

Implementation report:
- `./specs/codex-implementation-report.md`

Instructions:
- Do not modify implementation files during evaluation.
- Do not implement fixes during evaluation.
- If shell commands are needed, ask for approval before running them.
- If the implementation report is missing, incomplete, or inconsistent with changed files or validation evidence, stop and ask a precise clarification question.
```

구현 report 파일을 사용할 수 없거나 내용이 불완전하면, 사용자는 changed files, validation output, user-approved deviations, handoff summary를 평가 요청에 직접 붙여 넣을 수 있습니다.

## 11. 운영상 주의사항

- `implement.md`는 구현용이고, `evaluate.md`는 평가용입니다.
- 평가 세션에서 구현 파일을 수정하면 안 됩니다.
- `single-task`는 정확히 하나의 task 파일입니다.
- `task-set`은 사용자가 명시한 task 파일 목록입니다. Codex가 추측하면 안 됩니다.
- `all-tasks`는 task overview와 tasks directory의 관련 task 전체입니다.
- `task-set`과 `all-tasks`에서는 task 순서와 dependency를 반드시 확인해야 합니다.
- 파일 수정은 명시적 승인 후에만 가능합니다.
- shell 또는 terminal 명령 실행도 명시적 승인 후에만 가능합니다.
- validation 명령은 기본적으로 필요하지만 실행 전 승인이 필요합니다.
- 기본 구현 report 경로는 `./specs/codex-implementation-report.md`입니다.
- 구현 report 파일 생성 또는 수정도 명시적 승인 후에만 가능합니다.
- 구현 report는 선택된 execution scope에 대해 하나로 작성합니다. 사용자가 요청하지 않는 한 task별 report를 따로 만들지 않습니다.
- 평가 report도 선택된 evaluation scope에 대해 하나로 작성합니다.
- 기본 평가 report 경로는 `./specs/codex-implementation-eval.md`입니다.
- sanitized example 파일 같은 오래된 예시 파일 참조를 workflow에 포함하지 마세요.

## 12. 빠른 사용 요약

| 단계 | 사용 파일 | 사용자 입력 | Codex 결과 |
| --- | --- | --- | --- |
| 구현 요청 | `implement.md` | scope, target tasks, approval policy, validation 지시 | 승인된 범위의 구현과 evaluation-ready 구현 report |
| 구현 후 검증 | `implement.md` | `npm run lint`, `npm run test` 실행 승인 | validation 결과 보고 |
| 평가 요청 | `evaluate.md` | scope, target tasks, `./specs/codex-implementation-report.md` | 평가 report |
| 평가 report | `evaluate.md` | 필요 시 clarification 답변 | `./specs/codex-implementation-eval.md` |

가장 짧게 운영하려면 다음 순서를 사용하세요.

1. Gemini planning artifacts를 준비합니다.
2. `implement.md`로 Codex 구현 세션을 시작합니다.
3. scope와 target tasks를 명확히 지정합니다.
4. 파일 수정과 명령 실행을 batch 단위로 승인합니다.
5. `./specs/codex-implementation-report.md` 작성을 승인하거나, 승인하지 않을 경우 final response에 출력된 report 내용을 확보합니다.
6. `evaluate.md`로 Codex 평가 세션을 시작합니다.
7. 평가 report에서 `ACCEPT`, `REVISE`, `HALT` verdict를 확인합니다.
