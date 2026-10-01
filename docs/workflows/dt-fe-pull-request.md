# 일반 PR 생성 워크플로

## 범위와 시작

`dt-fe-pull-request` 스킬을 호출하면 이 절차를 적용함. 일반 작업 브랜치에서
`develop`으로 보내는 PR만 다룸. `develop → main` 배포 PR은 개발자가 GitHub에서
직접 진행함. Git 변경·commit·push·PR 생성 권한은 [AGENTS.md](../../AGENTS.md)의
경계를 따름.

1. 현재 브랜치, HEAD, upstream, `develop` 및 원격 상태, staged·unstaged·새 파일,
   기존 PR, 명시적 제외 파일을 확인함. 실제 브랜치나 이슈가 사용자 설명과 다르면
   차이를 알리고 대상을 확인함. 이슈 번호가 없으면 추측하지 않고 질문함.
2. `develop`에서 시작한다면 `git fetch origin develop`로 원격 최신 커밋을
   가져온 뒤 현재 HEAD가 `origin/develop`의 조상인지 확인함. fast-forward가
   가능할 때만 `git merge --ff-only origin/develop`로 `develop`을 갱신하고
   [AGENTS.md](../../AGENTS.md)의 이슈 브랜치 규칙으로 분기함. 미커밋 변경은
   보존함. 갱신이 변경과 충돌하거나 fast-forward가
   불가능하면 중단하고 상태를 사용자에게 알림. 변경을 폐기하거나 강제 갱신하지
   않음.
3. 이미 작업 브랜치라면 실제 이슈와 대상 브랜치를 확인하고 현재 변경을 유지함.
   상태 변경 명령이 중단되면 프로세스, 파일·Git 상태, HEAD와 lock을 확인한 뒤
   재시도 여부를 결정함.

## 선행 리뷰와 중단 조건

PR 작성 전에 **`dt-fe-code-review` 스킬을 먼저 호출**하고
[코드 리뷰 워크플로](dt-fe-code-review.md)에 따라 현재 PR 범위의 리뷰 보고서를
확인함. 보고서의 `상` 또는 `컨벤션 위반`이 하나라도 있으면 PR 진행을 중단함.
보완 계획과 변경 파일·검증 범위를 제시하고 수정 승인을 요청함. 승인 후 수정,
영향 범위 검증, 같은 범위의 재리뷰를 수행함. 차단 항목이 사라진 보고서를
확인한 뒤 진행함. `중`·`하`만 있으면 미해결 항목의 근거·영향을 PR 본문에
공개하고 진행함.

## 검증과 커밋

`npx vitest run`, `npm run lint`, `npm run build`를 실행하고 각 종료 상태와
핵심 결과를 기록함. 실패한 검증이 있으면 PR을 중단하고 원인과 보완 방법을
제시함. 실행 불가 항목은 이유, 수동 실행 명령과 확인할 동작을 제시하고
사용자 결정을 기다림. CI에서 빠진 중요한 검증도 PR 리뷰 요구사항에 수동
실행 명령과 확인 동작을 적음.

미커밋 변경을 커밋해야 하면 포함·제외 파일과 커밋 단위를 사용자에게 보여주고
승인을 받은 뒤 커밋함. `review-report-yyyy-mm-dd.md`와 `PR.md`는 로컬 산출물로
유지하고 커밋·push에서 제외함. 커밋 전 실제 브랜치와 staging을 다시 확인함.
커밋 후에는 PR에 들어갈 `develop...HEAD` 변경 범위를 다시 확인함.

## PR 본문과 생성

PR 제목은 `[{label}] {title}` 형식으로 작성함. `{label}`은 현재 브랜치 이름의
첫 `/` 앞 접두어에서 우선 파싱함. 접두어가 아래 GitHub 레이블 목록에 없거나
접두어가 없으면, 해당 목록에서 PR 변경의
주된 목적에 맞는 레이블을 선택함. 레이블 이름의 대소문자는 목록과 일치시킴.
`{title}`은 PR에 포함된 전체 변경을 종합해 에이전트가 결정함. 예를 들어 문서 변경을 포함한
`docs/#514-add-new-skills` 브랜치는 `[docs] PR 생성 및 리뷰 스킬 추가`로 작성함.

2026-10-01에 [저장소 레이블](https://github.com/debate-timer/debate-timer-fe/labels)을
조회한 목록임.

- `feat`: 기능 개발, `fix`: 버그 수정, `hotfix`: 긴급 수정임.
- `design`: UI 변경, `docs`: 문서 작업, `test`: 테스트 코드 작업임.
- `refactor`: 기능 변경 없는 코드 변경, `style`: 코드 컨벤션 변경임.
- `config`: 외부 라이브러리 추가·설정, `chore`: 파일 이동·이름 변경·삭제임.
- `deploy`: `develop → main` 배포이며 이 일반 PR 스킬의 대상에서 제외함.

루트 [PR 템플릿](../../.github/PULL_REQUEST_TEMPLATE.md)의 `연관 이슈`,
`작업 내용`, 선택적 `스크린샷`, `리뷰 요구사항` 형식으로 루트 `PR.md`를 작성함.
변경 배경, 사용 예시·정책·처리 흐름, 실제 검증 결과, 미실행 검증, 리뷰 관점과
미해결 `중`·`하` 발견 사항을 관련 항목에 적음. 이슈 연결 문구는 확인된 번호만
사용함.

push 직전에 실제 브랜치, upstream, 커밋과 diff, push 대상·범위, staging 및
제외 파일을 사용자에게 보여주고 **별도 승인**을 받음. 승인 전에는 push와 PR
생성을 진행하지 않음. 승인 후 확인한 범위만 push하고
`gh pr create --base develop --head <branch> --title "[{label}] {title}" --body-file PR.md`로
PR을 생성함.
명령이 중단되거나 실패하면 원격 브랜치·기존 PR 상태를 확인하고 중복 생성하지
않음. 생성된 PR 링크와 검증·리뷰 결과를 보고함.
