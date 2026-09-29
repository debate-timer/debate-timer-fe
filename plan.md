# 프로젝트 문서 체계 개편 계획

## 1. 목표와 확정 범위

사람과 에이전트가 같은 원본을 읽고 프로젝트 원칙, 아키텍처, 코드 작성 규칙을 빠르게 찾을 수 있는 문서 체계를 구성함. `criteria.md`의 단일 진입점·명시적 권위·주제별 소유권·작업별 읽기 경로는 활용하되, Android 모듈 구조를 복제하지 않고 React 화면, 훅, 서버 상태, 브라우저 경계와 Vite 실행 구조에 맞게 적용함.

이번 브랜치는 문서 체계와 문서에 직접 종속된 정리만 다룸. `docs/features`, `docs/workflows`, `docs/decisions`는 만들지 않으며, 기능 PRD 연결과 스킬 정리는 후속 브랜치 범위로 남김. 사용을 종료한 Speckit과 `specs/` 관련 잔여물은 제거함.

루트 `README.md`, `AGENTS.md`, `docs/**/*.md`는 권장 500자, 최대 700자를 적용함. 코드 블록, URL, 표 구분선, 공백, front matter를 포함한 Markdown 원문의 모든 문자를 셈. 이 계획서, 도구 프롬프트, GitHub PR·이슈 템플릿은 제한에서 제외함.

## 2. 설계 원칙

1. `docs/README.md`를 사람과 에이전트가 공유하는 단일 문서 포털로 사용함.
2. 규범의 권위는 `docs/CONSTITUTION.md` → `docs/ARCHITECTURE.md`와 상세 문서 → `AGENTS.md` → 루트 `README.md` 순으로 적용함.
3. 아키텍처 문서는 코드의 위치·책임·의존 방향, 컨벤션 문서는 코드를 작성하는 형식만 소유함.
4. 같은 규칙은 한 문서에만 두고 다른 문서는 링크함. 같은 단계의 문서가 충돌하면 임의 해석하지 않고 문서 오류로 처리함.
5. 진입 문서는 세부 규칙을 반복하지 않고 핵심 요약과 작업별 읽기 경로를 제공함.
6. 700자 안에 담기지 않는 주제는 독립적으로 이해 가능한 최소 의미 단위로 나눔. 링크만 가진 빈 문서는 만들지 않음.
7. `docs/README.md` 하나에 전체 권위·읽기 경로·아키텍처·컨벤션 요약을 모두 담으면 700자 안에서 필수 정보가 훼손되므로 `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/conventions/README.md`로 분리함.
8. 산출 문서는 Markdown으로 작성하고 문장 종결은 `~함`, `~했음` 등 명사형을 사용함. 중복과 부가 설명을 제거하고 필수 내용 및 필수 내용을 이해하는 데 필요한 정보만 남김.

## 3. 예상 최종 구조

```text
debate-timer-fe/
├── README.md
├── AGENTS.md
└── docs/
    ├── README.md
    ├── CONSTITUTION.md
    ├── ARCHITECTURE.md
    ├── architecture/
    │   ├── structure.md
    │   ├── runtime.md
    │   ├── ui-state.md
    │   ├── data-access.md
    │   ├── routing-i18n.md
    │   ├── realtime.md
    │   ├── errors-observability.md
    │   └── analytics.md
    └── conventions/
        ├── README.md
        ├── docs.md
        ├── typescript.md
        ├── react.md
        ├── ui-accessibility.md
        ├── styling-assets.md
        ├── data-access.md
        └── testing-storybook.md
```

`scripts/check-docs.mjs`는 작업 중 지역 검증에만 사용하고 최종 구조와 PR에 포함하지 않음. 삭제된 기존 `docs/analytics-dashboard.md`, `docs/live-share-timer-sync.md`, `docs/local-backend-login.md`는 이동·요약·대체하지 않음.

## 4. 문서별 역할과 주요 내용

### 4.1 진입점과 최상위 규범

| 문서                   | 역할과 필수 내용                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`            | 사람을 위한 공개 진입점. 서비스 소개, 최소 실행 명령, 배포 주소, `docs/README.md` 링크만 포함함.                                                                        |
| `AGENTS.md`            | 에이전트 실행 진입점. 권위 순서, 작업별 필수 읽기, 사용자 변경 보존, 검증·Git 권한 경계, `{type}/#{issue}-{slug}` 브랜치 규칙을 포함함. 기술 규칙 본문은 복제하지 않음. |
| `docs/README.md`       | 전체 문서 포털. 권위 순서, 디렉터리 역할, 작업별 읽기 경로, 아키텍처·컨벤션의 최상위 요약을 포함함.                                                                     |
| `docs/CONSTITUTION.md` | 유일한 헌법 원본. 제품·기술의 불변조건, 금지 사항, 중단 조건, 변경 승인 방식만 포함함.                                                                                  |
| `docs/ARCHITECTURE.md` | React 18 + Vite 앱의 계층, 핵심 의존 방향, 상세 아키텍처 문서 선택 기준을 요약함.                                                                                       |

### 4.2 상세 아키텍처

| 문서                                   | 역할과 필수 내용                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture/structure.md`            | `page`, `components`, `hooks`, `apis`, `repositories`, `util`, `types`의 책임과 허용 배치를 정의함.                                             |
| `architecture/runtime.md`              | MSW 시작, QueryClient·Portal·Router 조립, Sentry·i18n 초기화 순서와 소유권을 설명함.                                                            |
| `architecture/ui-state.md`             | 페이지·로컬 UI·공용 UI·레이아웃의 경계와 컴포넌트 상태·페이지 훅·공용 훅·서버 상태의 소유권을 정의함.                                           |
| `architecture/data-access.md`          | Axios instance → `request<T>` → 도메인 API → Query/Mutation → Repository의 호출 방향과 MSW 경계를 정의함.                                       |
| `architecture/routing-i18n.md`         | 라우트 표, 인증, 언어 경로, 이동 경로 생성, 언어 감지·전파 책임을 정의함.                                                                       |
| `architecture/realtime.md`             | SocketManager, React socket 훅, 역할별 훅의 계층과 연결·구독 수명만 정의함. 삭제된 라이브 공유 문서의 기능 계약은 복원하지 않음.                |
| `architecture/errors-observability.md` | 도메인 오류, 지역 복구 UI, ErrorBoundary, Sentry 수집·마스킹·중복 방지 책임을 정의함.                                                           |
| `architecture/analytics.md`            | GA4와 Amplitude를 병행하는 provider adapter, manager, hook의 의존 방향과 공통 속성·실패 격리 원칙을 정의함. 대시보드 운영 내용은 포함하지 않음. |

### 4.3 코드 및 문서 컨벤션

| 문서                               | 역할과 필수 내용                                                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `conventions/README.md`            | 컨벤션 전체 요약과 코드 종류별 읽기 경로를 제공함. 상세 규칙을 반복하지 않음.                                                     |
| `conventions/docs.md`              | Markdown 사용, 500자 권장·700자 상한, 명사형 종결, 중복 금지, 필수 내용 선별, 원본 한 곳 유지, 링크 작성 규칙을 정의함.         |
| `conventions/typescript.md`        | 이름, 변수, 상수, 함수 선언, `interface`·`type`, null·type guard, export, 한국어 주석 규칙을 정의함. import 순서는 규정하지 않음. |
| `conventions/react.md`             | 함수 선언형 컴포넌트, Props 본문 구조분해, 훅 위치, effect cleanup, callback·ref, 상태 분기 규칙을 정의함.                        |
| `conventions/ui-accessibility.md`  | 시맨틱 요소, 번역된 버튼 이름, ARIA 상태, controlled 입력, 사용자 문구 i18n 범위를 정의함.                                        |
| `conventions/styling-assets.md`    | Tailwind와 제한된 공통 CSS, 긴 `className` 분리, DT 아이콘 직접 import 범위를 정의함.                                             |
| `conventions/data-access.md`       | Query·Mutation 이름과 옵션, API 함수·타입·endpoint 형식, Repository와 MSW 작성 형식을 정의함.                                     |
| `conventions/testing-storybook.md` | TDD 순서, 테스트 인접 배치, 한국어 `describe`·`it`, Testing Library·MSW·fake timer, typed CSF와 Story 상태 표현을 정의함.         |

## 5. 현행 항목별 처리 계획

| 현행 항목                           | 처리 계획                                                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `conventions.md`                    | 확정된 규칙만 `docs/architecture/*`와 `docs/conventions/*`로 분리한 뒤 삭제함. 조사 수치, 대표 근거, 의사결정 과정은 보존하지 않음. |
| `criteria.md`, `document-system.md` | 새 문서 작성과 정보 손실 점검에 사용한 뒤 삭제함. 별도 보관 문서나 결정 기록을 만들지 않음.                                         |
| `.specify/memory/constitution.md`   | 삭제함. 헌법은 `docs/CONSTITUTION.md`만 유지함. 빈 `.specify/` 디렉터리도 남기지 않음.                                              |
| `AGENTS.md`의 Speckit 절            | 제거함. 현재 남은 `.specify/` 및 Speckit 경로 참조도 함께 제거함.                                                                   |
| `.gitignore`의 `/specs`             | 더 이상 사용하지 않으므로 설명 주석과 규칙을 제거함. `specs/`와 Speckit 산출물은 새 체계에서 사용하지 않음.                         |
| 기존 `docs/*.md` 3건                | 사용자가 삭제한 상태를 유지함. 해당 내용을 새 아키텍처·컨벤션에 기능 계약이나 운영 가이드로 옮기지 않음.                            |
| 루트 `README.md`, `AGENTS.md`       | 700자 이하 진입 문서로 축소하고 상세 규칙은 소유 문서에 연결함.                                                                     |
| `src/type/`                         | 확정된 컨벤션에 맞춰 `src/types/`로 이관하고 import를 갱신함. 문서에는 목표가 아닌 현재 구조로 기록함.                              |
| 분석 구성                           | GA4와 Amplitude 병행을 현행 계약으로 문서화함. 어느 한쪽을 폐기 예정으로 표현하지 않음.                                             |
| 브랜치 규칙                         | `{type}/#{issue}-{slug}`를 유일한 형식으로 문서화하고 기존의 `feature/*`, `feat/*` 표현을 제거함.                                   |

스킬 파일과 스킬 운영 방식은 이번 브랜치에서 수정하지 않음. 존재하지 않는 `.claude/`, `.codex/` 등의 과거 조사 결과도 복원하거나 새 어댑터로 만들지 않음.

## 6. 구현 순서

1. 권장 500자·최대 700자 기준을 포함한 `docs/conventions/docs.md`의 품질 규칙을 먼저 작성함.
2. 실제 코드와 `conventions.md`를 대조해 상세 아키텍처와 코드 컨벤션 문서를 작성함.
3. `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/conventions/README.md`에 서로 다른 수준의 요약과 읽기 경로를 작성함.
4. `docs/CONSTITUTION.md`에 최상위 불변조건만 옮기고 기존 Constitution 및 Speckit 잔여 참조를 제거함.
5. 루트 `README.md`와 `AGENTS.md`를 짧은 진입점으로 재작성하고 확정된 브랜치 규칙을 반영함.
6. `src/type/`을 `src/types/`로 이관하고 모든 import와 문서 경로를 일치시킴.
7. `criteria.md`, `document-system.md`, `conventions.md`를 삭제하고 남은 문서에서 이 파일을 참조하지 않는지 확인함.
8. 지역 전용 `scripts/check-docs.mjs`로 길이·링크·고아 문서를 검사한 뒤 스크립트와 관련 package·CI 변경을 최종 diff에서 제거함.
9. 문서별 정보 손실 대조, Markdown 품질 검토, 코드 경로 변경 검증을 수행함.

## 7. 검증 및 완료 조건

- 모든 산출 문서를 Markdown으로 작성하고 명사형 어미를 사용했음.
- 루트 `README.md`, `AGENTS.md`, `docs/**/*.md`의 Markdown 원문 전체 문자를 세어 상한 이내임을 확인했음.
- 500자를 넘은 대상은 지역 검사에서 경고하고, 700자를 넘은 대상은 실패 처리했음.
- `docs/README.md`에서 모든 문서로 도달 가능하며 깨진 상대 링크와 고아 문서가 없음.
- 문서별 소유 책임이 중복되지 않고, 요약 문서는 상세 규칙을 복제하지 않음.
- 필수 내용으로 대체 가능한 예시·배경·반복 설명을 제거했음.
- `conventions.md`의 확정 규칙이 새 문서에 보존됐으며 조사 수치와 결정 이력은 의도대로 폐기했음.
- Speckit, `specs/`, 삭제된 기존 `docs/*.md` 3건, `docs/features`, `docs/workflows`, `docs/decisions`의 파일이나 참조가 남지 않음.
- GA4와 Amplitude 병행, `{type}/#{issue}-{slug}` 브랜치 형식, `src/types/` 경로가 문서와 코드에서 일치함.
- `src/types/` 이관 후 lint·test·build를 실행해 import와 타입 검사를 검증했음.
- 길이 검사 스크립트와 이를 위한 package·CI 변경이 최종 Git diff와 PR에 포함되지 않음.
