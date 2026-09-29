# 문서 체계 개편 계획

## 1. 목표와 확정 범위

사람과 에이전트가 프로젝트 원칙, 아키텍처, 코드·문서 작성 규칙의 원본을 빠르게 찾을 수 있도록 문서 체계를 개편한다. 기술 내용은 `conventions.md`의 확정 규칙과 실제 코드에 근거한다. Android 저장소에서는 최상위 원칙, 주제별 책임, 작업별 읽기 경로, 현재와 목표의 구분 방식을 참고하되 Android 고유의 기술 정책은 옮기지 않는다.

샘플 저장소는 로컬의 `C:\Workspace\Git\28th-App-Team-1-Android\docs`가 맞다. GitHub 이름 변경이 로컬 폴더명에 반영되지 않은 상태다. `criteria.md`는 이 문서 체계의 비교 자료, `document-system.md`는 과거 상태를 파악하는 기록으로만 사용한다.

이번 개편의 범위는 `AGENTS.md`, `docs/`의 새 규범·아키텍처·컨벤션 문서, `.github`의 Markdown 템플릿 점검, Constitution 이전과 Speckit 잔여 참조 제거, `src/type/`에서 `src/types/`로의 코드 이관이다. `README.md`는 사용자가 직접 편집하므로 이 작업에서 수정하지 않는다. 문서 작성 컨벤션은 향후 그 파일에도 적용한다.

현재 `docs/analytics-dashboard.md`, `docs/live-share-timer-sync.md`, `docs/local-backend-login.md`는 이번 개편에서 **삭제**한다. 내용 이관이나 대체 문서는 만들지 않는다. 애널리틱스 문서 전체와 `docs/workflows/`는 이번 범위에서 제외한다. GA4와 Amplitude는 현재 병행 운영하며 앞으로도 병행할 예정이나, 그 운영·코드 컨벤션은 이번 문서 산출물에 포함하지 않는다. 워크플로 문서는 다음 PR에서 다룬다.

`conventions.md`, `criteria.md`, `document-system.md`는 작업 중 근거 자료로 그대로 남기고 이번 작업의 새 커밋에 포함하지 않는다. 사용자가 PR 병합 직전에 삭제한다. 이 세 파일은 현재 브랜치의 `develop...HEAD` 차이에는 이미 추가 파일로 나타나므로, 사용자가 삭제하기 전까지 최종 PR 차이에도 남는다는 점을 확인한다.

## 2. 문서의 권위와 분할 원칙

1. `docs/CONSTITUTION.md`를 유일한 최상위 원칙 원본으로 둔다. 현재 `.specify/memory/constitution.md`의 유효한 원칙을 이전한 뒤 예전 파일과 Speckit 전용 조항을 제거한다. 헌법의 변경 통제·팀 합의 원칙은 이전 과정에서 완화하지 않는다.
2. `docs/README.md`를 **아키텍처와 컨벤션의 단일 진입점**으로 둔다. 별도 `docs/ARCHITECTURE.md`와 별도 컨벤션 색인은 만들지 않는다. 헌법을 구현하는 기술 구조와 규칙별 소유 문서를 찾아가는 길잡이로 사용한다.
3. Constitution은 변경할 수 없는 원칙과 금지·중단 조건을 소유한다. `docs/README.md`는 해당 원칙이 이 저장소의 어느 계층·문서에서 구체화되는지 연결한다. 주제별 상세 아키텍처·컨벤션은 정확한 경로·호출·작성 규칙을 소유한다. 하위 문서는 상위 원칙을 완화할 수 없으며, 상위 문서는 하위 규칙 본문을 복제하지 않는다.
4. `docs/README.md`는 상세 문서를 구속력 있는 계약으로 편입하되, 그 안의 짧은 요약이 상세 계약을 대체하거나 재정의하지 않는다고 명시한다. Constitution과 충돌하면 Constitution이 우선한다. README의 요약과 상세 문서가 다르거나 상세 문서끼리 충돌하면 어느 쪽도 임의로 선택하지 않고 문서 오류로 보고·수정한다. `AGENTS.md`는 실행 절차, 루트 `README.md`는 공개 안내를 소유한다.
5. 아키텍처 상세 문서는 책임·의존 방향·호출 흐름·수명을, 코드 컨벤션 상세 문서는 작성 형식과 검증 방식을, `docs/conventions/docs.md`는 문서 작성 방식을 소유한다.
6. 확정 규칙은 적용 범위, 예외, 대표 코드 근거와 함께 기록한다. `conventions.md`의 관찰 후보와 폐기된 항목을 새 규칙으로 만들지 않는다. 특히 `import` 순서, `import type` 강제, 주 컴포넌트·훅 이외의 export 방식은 새 규칙으로 추가하지 않는다.
7. 목표 규칙과 현재 코드를 구분해 작성한다. 코드 이관이 끝나기 전에는 `src/types/`를 현재 경로라고 기록하지 않고, 이관과 import 검증이 끝나면 문서를 실제 경로에 맞춘다.
8. 문서 분할은 독자가 한 작업에서 함께 읽는 내용을 기준으로 한다. 자잘한 규칙마다 파일을 만들지 않고, 서로 다른 소유권이나 독자 과제가 있을 때만 나눈다. 짧은 진입 문서나 단일 주제 문서는 분량을 채우기 위해 늘리지 않는다.

### 2.1 Android 샘플에서 적용할 관계

Android의 `docs/CONSTITUTION.md`는 제품 목적, 데이터 보호, 주요 계층 경계, 금지 변경, 중단 조건과 헌법 변경 통제를 소유한다. `docs/ARCHITECTURE.md`는 그 아래에서 기술 개요와 핵심 계약의 요약, 상세 아키텍처 문서 목록, 작업별 읽기 표, 현재·목표의 해석 방법을 제공한다. 상세 문서는 다시 모듈 책임이나 화면 구성처럼 주제별 계약을 소유한다. Android Architecture의 요약도 상세 문서를 대체하지 않는다고 선언한다.

이 저장소는 Android의 `ARCHITECTURE.md`와 전체 문서 색인을 `docs/README.md` 하나로 합치므로, 같은 상하 관계를 **Constitution → README의 기술 지도 → 주제별 상세 계약**으로 구현한다. Android Constitution에 기술 경계의 금지 사항이 일부 포함된 점은 참고하되, React·Vite 구현의 세부 경로·함수 이름을 헌법에 중복 나열하지 않는다.

### 2.2 두 문서에 실제로 넣을 내용

| 주제           | `docs/CONSTITUTION.md`가 소유                                                        | `docs/README.md`가 소유                                                           | 세부 원본                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 문서 권위·변경 | 헌법의 최상위 지위, 팀 합의와 변경 통제, 충돌·중단 조건                              | 상세 문서의 편입, 문서 종류·읽기 순서·작업별 선택 표                              | `AGENTS.md`의 실행 절차                                                                                          |
| 제품과 계층    | 토론 타이머라는 제품 목적과 기능별 책임 분리의 필수 원칙, 경계를 약화할 수 없는 조건 | 현재 앱 계층 지도, `page`·공용 UI·hooks·apis·repositories의 역할 요약과 의존 흐름 | `architecture/structure-and-ui.md`, `architecture/data-access.md`                                                |
| 코드 일관성    | 코드가 확정된 컨벤션을 따라야 한다는 의무                                            | TypeScript·React/UI·데이터·테스트 규칙의 주제별 한 줄 안내와 소유 문서 링크       | `conventions/*.md`의 구체적인 명명·선언·배치 규칙                                                                |
| TDD와 검증     | 기능 구현에서 테스트를 먼저 작성해야 한다는 필수 원칙                                | 테스트 작업에 읽을 문서와 검증 경로 안내                                          | `conventions/testing-and-storybook.md`의 Red→Green→Refactor, 테스트 위치·작성·모킹 방식; `AGENTS.md`의 실행·보고 |
| 국제화         | 사용자 대면 문구를 번역 체계로 관리해야 한다는 필수 원칙                             | 앱의 언어·라우팅 흐름과 관련 상세 문서 안내                                       | `architecture/app-routing-i18n.md`, `conventions/react-and-ui.md`의 적용 범위·`useTranslation()` 방식            |
| 기술과 현황    | 특정 라이브러리 버전, 명령어, 폴더 목록을 고정하지 않음                              | 현행 React 18/Vite 등 기술 개요, 현재와 목표의 차이, 대표 코드 경로               | 해당 상세 아키텍처·컨벤션 문서와 실제 코드                                                                       |

기존 Constitution의 `Layered Folder Structure`는 **책임 분리 원칙**만 헌법에 남기고 디렉터리별 목록은 아키텍처로 옮긴다. `Consistent Code Style`은 **확정 컨벤션 준수 의무**만 남기고 PascalCase·함수 선언·상수명 등은 컨벤션 문서로 옮긴다. `TDD`와 `i18n First`는 필수 원칙을 헌법에 남기고 절차·API·예외를 상세 문서로 옮긴다. 기술 스택 표와 기능 생성 절차는 README의 기술 지도·관련 상세 문서로, 품질 검사 명령과 결과 보고는 `AGENTS.md`로 옮긴다. Governance의 팀 합의·변경 통제는 헌법에 남기고 Speckit·`specs/` 조항은 폐기한다. 이 이동은 규칙의 적용 의무를 없애는 것으로 해석하지 않는다. 헌법의 기존 규칙을 옮기는 과정에서 의미를 바꿔야 한다면 단순 문서 정리로 처리하지 않고 팀 합의가 필요한 원칙 변경으로 구분한다. Android의 민감 데이터·모듈 금지 정책은 이 저장소의 새 금지 조건으로 가져오지 않는다.

## 3. 문서 작성 컨벤션과 길이

`docs/conventions/docs.md`를 새로 만들고 다음 규칙의 단일 원본으로 삼는다. 적용 범위는 `docs/**/*.md`, 루트 `AGENTS.md`·`README.md`, `.github`의 이슈·PR 등 Markdown 템플릿이다. `plan.md`와 `.github/workflows/*.yml`은 적용 대상이 아니다.

- 문서는 Markdown으로 작성함.
- 문서 원문의 **권장 300줄, 최대 500줄**을 적용함. 빈 줄, 표, 코드 블록, front matter를 포함한 물리적 줄 수를 셈.
- 문장형 어미(`~했다`, `~한다`) 대신 명사형 어미(`~했음`, `~함`)로 종결함. 코드, 인용, 고유명사, 명령어는 원형을 유지함.
- 동일한 정책과 설명을 여러 문서에 복사하지 않고 소유 문서로 연결함.
- 없으면 안 되는 필수 내용만 남기고, 필수 내용으로 충분히 이해되는 배경·예시·반복 문장은 생략함. 단, 호출 방법·흐름·경계·검증에 필요한 설명까지 지우지 않음.

`docs/README.md`만 권장 300줄을 적용하지 않고 **최대 500줄**을 적용한다. 아키텍처와 컨벤션의 개요 및 작업별 읽기 표를 한 문서에 모아야 하기 때문이다. 다른 대상이 300줄을 넘으면 중복을 먼저 줄이고 의미 단위 분할을 검토한다. 500줄 초과는 완료 조건 위반으로 처리한다. 사용자가 직접 편집하는 루트 `README.md`는 수정하지 않고 읽기 전용으로 검사해 불일치만 보고한다.

## 4. 최종 문서 구조와 분량 예산

```text
AGENTS.md
docs/
├── README.md
├── CONSTITUTION.md
├── architecture/
│   ├── structure-and-ui.md
│   ├── app-routing-i18n.md
│   ├── data-access.md
│   ├── realtime.md
│   └── errors-observability.md
└── conventions/
    ├── docs.md
    ├── typescript-and-structure.md
    ├── react-and-ui.md
    ├── data-and-realtime.md
    └── testing-and-storybook.md
```

`README.md`와 `.github` 템플릿은 규칙 적용·점검 대상이지만 위 트리에는 이번에 생성·수정할 문서만 표시했다. `.github` 템플릿에서 규칙 위반이 확인되면 해당 Markdown만 필요한 만큼 수정한다. 이슈·PR 템플릿의 입력 칸, 제목과 실제 사용 계약은 유지한다.

| 문서                                      | 소유할 내용                                                                                                                                                                                   | 예상 줄 수 |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: |
| `AGENTS.md`                               | 에이전트 작업 절차, 관련 문서 읽기, 기존 변경 보존, 검증·권한 경계, `feat/#{issue}-{slug}` 브랜치 규칙                                                                                        |     80~150 |
| `docs/README.md`                          | 헌법과 상세 계약의 연결, React 18/Vite 기술·계층 지도, 아키텍처·컨벤션 주제별 요약, 상세 문서 편입, 작업별 읽기·갱신 표, 현재·목표 구분. 헌법 원칙이나 상세 규칙을 독자적으로 재정의하지 않음 |    250~450 |
| `docs/CONSTITUTION.md`                    | 제품 목적, 책임 분리·TDD·국제화의 필수 원칙, 금지·중단 조건, 문서 권위와 팀 합의·변경 통제. 구현 경로·명명·테스트 절차는 하위 문서에 연결                                                     |    100~200 |
| `architecture/structure-and-ui.md`        | `page`·공용 UI·layout·hooks·types·util의 책임과 상태 소유권                                                                                                                                   |    170~270 |
| `architecture/app-routing-i18n.md`        | 앱 초기화, Provider·MSW 시작, 라우트·인증·언어 경로와 언어 동기화                                                                                                                             |    150~240 |
| `architecture/data-access.md`             | Axios → `request<T>` → 도메인 API → Query/Mutation·Repository의 호출 방향과 MSW 경계                                                                                                          |    170~270 |
| `architecture/realtime.md`                | SocketManager·역할별 훅의 계층, 연결·구독 수명, 메시지 검증·순서·재연결의 코드 기반 계약                                                                                                      |    150~250 |
| `architecture/errors-observability.md`    | 도메인 오류, 지역 복구·ErrorBoundary, Sentry 분류·마스킹·중복 방지                                                                                                                            |    150~250 |
| `conventions/docs.md`                     | Markdown·줄 수·명사형 어미·중복·필수 내용 선별·링크와 갱신 기준                                                                                                                               |     70~130 |
| `conventions/typescript-and-structure.md` | 이름·상수·함수·타입·import·export·조건문·주석과 파일 배치                                                                                                                                     |    170~270 |
| `conventions/react-and-ui.md`             | 컴포넌트·Props·훅·effect·상태·Tailwind·i18n·접근성·아이콘 작성 규칙                                                                                                                           |    190~290 |
| `conventions/data-and-realtime.md`        | Query/Mutation·API·MSW·Repository·소켓의 명명·옵션·검증 형식                                                                                                                                  |    170~270 |
| `conventions/testing-and-storybook.md`    | TDD, 한국어 `describe`·`it`, Testing Library·MSW·fake timer, typed CSF·Story 상태                                                                                                             |    160~260 |

`architecture/realtime.md`는 소켓 계층과 코드에서 확인되는 계약을 설명한다. 삭제하는 `docs/live-share-timer-sync.md`의 기능 설명을 그대로 이관하지 않는다. `architecture/errors-observability.md`도 Sentry 오류 관측만 다루고 GA4·Amplitude 정책은 다루지 않는다.

## 5. `conventions.md` 이관 지도

| 원본 범위                                     | 규칙 소유 문서                                                                   | 대표 코드 근거                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 2장 전체 구조, 19장 배치                      | `architecture/structure-and-ui.md`, `conventions/typescript-and-structure.md`    | `src/page/TimerPage/`, `src/components/DialogModal/`, `src/hooks/`                       |
| 3장 TypeScript·모듈, 6장 타입·유틸, 11장 상수 | `conventions/typescript-and-structure.md`                                        | `src/util/tableValidation.ts`, `src/apis/sockets/util.ts`, `src/constants/errors.ts`     |
| 4장 일반 훅·부수 효과, 5장 UI                 | `architecture/structure-and-ui.md`, `conventions/react-and-ui.md`                | `src/hooks/useDocumentVisibility.ts`, `src/components/DropdownMenu/`                     |
| 4.1장 TanStack Query                          | `architecture/data-access.md`, `conventions/data-and-realtime.md`                | `src/hooks/query/`, `src/hooks/mutations/`                                               |
| 7장 Story, 8장 테스트                         | `conventions/testing-and-storybook.md`                                           | `src/components/DialogModal/`, `src/apis/apis/live.test.ts`, `setup.ts`                  |
| 9~10장 HTTP·API, 12장 MSW, 16장 Repository    | `architecture/data-access.md`, `conventions/data-and-realtime.md`                | `src/apis/axiosInstance.ts`, `src/apis/primitives.ts`, `src/mocks/`, `src/repositories/` |
| 13장 라우팅, 18장 앱 초기화·국제화            | `architecture/app-routing-i18n.md`, UI 문구 형식은 `conventions/react-and-ui.md` | `src/routes/routes.tsx`, `src/routes/LanguageWrapper.tsx`, `src/main.tsx`, `src/i18n.ts` |
| 14장 오류·관측                                | `architecture/errors-observability.md`                                           | `src/components/ErrorBoundary/`, `src/util/sentry.ts`                                    |
| 15장 실시간 소켓                              | `architecture/realtime.md`, `conventions/data-and-realtime.md`                   | `src/apis/sockets/SocketManager.ts`, `src/hooks/sockets/`                                |
| 17장 분석·추적                                | 이번 문서화 범위에서 제외                                                        | GA4·Amplitude 병행 사실은 확인했으나 정책 문서를 만들지 않음                             |
| 20~24장 확정 결과·의사결정                    | 범위에 해당하는 위 문서에 반영                                                   | 관찰 후보와 폐기 항목을 걸러 확정 규칙만 대조                                            |

컴포넌트 본문 Props 구조분해, 컴포넌트 내부의 화살표 함수·파일 최상단의 함수 선언문, 모든 상수의 `UPPER_SNAKE_CASE`, 모든 조건문의 중괄호, 공용 타입의 `src/types/` 배치, 모든 버튼의 번역된 `aria-label`, 모든 도메인 API 함수의 직접 MSW 테스트, 브라우저·Node의 MSW 핸들러 공유, `it`·한국어 테스트 이름, 제한된 JSDoc 대상은 확정 규칙으로 빠짐없이 이관한다. 기존 코드의 예외를 새 규칙으로 승격하지 않는다.

## 6. 현행 항목별 처리

| 항목                                                  | 이번 개편에서 할 일                                                                                                               |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 기존 `docs/*.md` 세 건                                | 모두 삭제한다. 새 문서에서 내용·링크를 되살리지 않는다.                                                                           |
| `.specify/memory/constitution.md`                     | 유효한 상위 원칙을 `docs/CONSTITUTION.md`로 이전한 뒤 삭제한다. Speckit 절차·`specs/` 수명 주기 조항과 깨진 경로 참조를 제거한다. |
| `AGENTS.md`                                           | Speckit 안내를 제거하고 새 문서 읽기 경로와 `feat/#{issue}-{slug}`를 반영한다. 문서·코드 정책 본문은 상세 문서에 연결한다.        |
| `src/type/type.ts`, `src/type/fullscreen.d.ts`        | `src/types/`로 이동하고 모든 import·선언 참조를 갱신한다. 기능 동작은 변경하지 않는다.                                            |
| `README.md`                                           | 사용자가 직접 편집한다. 에이전트는 수정하지 않고 새 체계와의 링크·브랜치 규칙·문서 작성 규칙 불일치만 보고한다.                   |
| `.github`의 Markdown 템플릿                           | `docs/conventions/docs.md`의 범위에 포함한다. 템플릿 내용과 형식을 점검하고 필요한 최소 수정만 한다.                              |
| `conventions.md`, `criteria.md`, `document-system.md` | 원문을 수정·삭제하거나 새 커밋에 포함하지 않는다. 사용자가 PR 병합 직전에 삭제한다.                                               |
| GA4·Amplitude                                         | 병행 운영 사실을 전제로 하되 이번에는 애널리틱스 문서와 관련 컨벤션을 작성하지 않는다.                                            |

## 7. 실행 순서

1. 실제 코드와 `conventions.md`의 확정 규칙을 대조해 5장 이관 지도를 규칙 단위로 점검한다. 현재 경로, 타입 import, `.github` 템플릿, Speckit 참조를 다시 확인한다.
2. `docs/conventions/docs.md`를 먼저 작성하고 길이·문체·중복 기준을 확정한다. 2.2절의 기존 Constitution 항목별 배치에 따라 `docs/CONSTITUTION.md`에 필수 원칙·변경 통제만 이전하고 구현 목록 및 폐기한 Speckit 조항을 분리한다.
3. 상세 아키텍처 5개와 코드 컨벤션 4개를 작성한다. 헌법에서 옮긴 세부 규칙의 적용 의무를 유지하고, 각 규칙의 정확한 소유 문서와 대표 코드 근거를 표시한다. 분석·워크플로·기존 `docs/*.md`의 내용을 이관하지 않는다.
4. `docs/README.md`에 헌법에서 상세 계약까지 이어지는 관계, 아키텍처·컨벤션의 핵심 개요, 전체 색인, 작업별 필수 읽기·갱신 표를 한데 작성한다. 2.2절에서 헌법이 소유하는 문장을 독립적인 README 정책으로 다시 쓰지 않고 상세 본문은 링크로 연결한다.
5. `src/type/`의 두 파일을 `src/types/`로 옮기고 import·선언 참조를 갱신한다. 이관 완료 후 문서의 현재 경로를 실제 코드와 일치시킨다.
6. `AGENTS.md`의 Speckit·이전 Constitution 참조를 제거하고 브랜치 규칙을 갱신한다. 기존 `docs/*.md` 세 건과 옛 Constitution을 삭제하고 새 경로로 링크를 갱신한다. `.github` Markdown 템플릿을 확인해 필요한 최소 변경을 적용한다.
7. 문서·코드 검증을 마친 뒤 범위 밖의 사용자 파일과 이미 존재하는 다른 브랜치 변경을 건드리지 않았는지 확인한다. 참고 자료 세 파일은 그대로 남기고, 사용자가 병합 직전에 삭제할 항목으로 보고한다.

## 8. 검증과 완료 기준

- `docs/README.md`는 500줄 이하이고 아키텍처·컨벤션 개요, 상세 문서 목록, 작업별 읽기 경로를 한곳에서 제공한다. 그 밖의 적용 문서는 300줄을 권장하고 500줄을 넘기지 않는다. 빈 줄·표·코드 블록·front matter를 포함해 물리적 줄 수를 검사한다.
- 2.2절의 각 주제에서 상위 원칙은 Constitution, 기술 지도와 읽기 경로는 `docs/README.md`, 정확한 구현 규칙은 주제별 상세 문서가 각각 소유한다. README 요약은 상세 계약을 대체하지 않으며, 상하 문서 간 불일치와 상세 문서끼리의 불일치를 문서 오류로 처리한다.
- 새 문서와 수정한 `AGENTS.md`·`.github` Markdown 템플릿은 명사형 어미, 중복 최소화, 필수 내용 선별 기준을 검토한다. 사용자가 편집할 `README.md`는 읽기 전용 점검 결과만 보고한다.
- `docs/README.md`에서 모든 새 문서에 도달하고 상대 링크·앵커·코드 경로가 실제로 존재한다. `docs/ARCHITECTURE.md`, 옛 Constitution, 삭제된 세 `docs/*.md`, Speckit 경로를 가리키는 남은 참조가 없다.
- 5장 이관 지도에서 **이번 범위에 포함한** 확정 규칙은 누락·중복 없이 소유 문서에 기록한다. 분석·추적 17장과 폐기된 관찰 후보는 문서화하지 않는다.
- `src/type/`의 두 파일과 참조가 `src/types/`로 이관된다. 관련 타입 검사·lint·test·build를 실제 실행하고 결과를 보고한다. 실패하거나 실행하지 못한 항목을 통과로 적지 않는다.
- `feat/#{issue}-{slug}`가 에이전트 문서의 유일한 브랜치 규칙이고, `README.md`에서 발견되는 이전 표현은 사용자 편집 대상으로 보고한다. GA4·Amplitude의 병행 운영을 한쪽 폐기 정책으로 잘못 기술하지 않는다.
- 이번 작업의 새 커밋에 `conventions.md`, `criteria.md`, `document-system.md`의 수정·삭제를 포함하지 않는다. 세 파일은 사용자가 병합 직전에 삭제할 수 있도록 남긴다.
