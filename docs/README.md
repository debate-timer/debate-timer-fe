# Debate Timer FE 문서 지도

이 문서는 프로젝트 아키텍처와 코드 컨벤션의 진입점임. 토론 테이블 구성, 타이머
실행, 투표를 제공하는 React 18·Vite SPA의 현재 구조를 요약하고 작업별 상세
계약을 연결함. 제품 원칙은 [헌법](CONSTITUTION.md)이 소유함.

## 1. 문서의 권위와 읽기 순서

1. [헌법](CONSTITUTION.md)의 필수 원칙과 변경 통제를 먼저 확인함.
2. 이 문서에서 관련 계층과 읽기 경로를 찾음.
3. 해당 [아키텍처](#3-아키텍처-상세-계약)와 [컨벤션](#4-코드와-문서-컨벤션) 상세
   문서를 읽음.

이 문서는 아래 상세 문서를 구속력 있는 계약으로 편입함. 이 문서의 요약은 상세
계약을 대체하거나 재정의하지 않음. 헌법과 직접 충돌하면 헌법을 우선함. 이 문서의
요약과 상세 계약이 다르거나 상세 문서끼리 다르면 문서 오류로 보고·수정함.
[AGENTS.md](../AGENTS.md)는 에이전트의 실행 절차, 루트
[README.md](../README.md)는 공개 안내를 소유함. `docs/workflows/`는
저장소 전용 스킬의 실행 흐름과 중단·검증 절차를 소유함. 스킬 진입점은
`.agents/skills/`와 `.claude/skills/`에 둠.

## 2. 현재 기술과 계층 지도

| 영역              | 현재 기술 또는 경계                     | 대표 코드                                      |
| ----------------- | --------------------------------------- | ---------------------------------------------- |
| 앱 실행·UI        | React 18, Vite, TypeScript strict       | `src/main.tsx`, `src/page/`, `src/components/` |
| 라우팅·언어       | React Router v7, i18next                | `src/routes/routes.tsx`, `src/i18n.ts`         |
| 서버 상태·HTTP    | TanStack Query 5, Axios                 | `src/hooks/query/`, `src/apis/primitives.ts`   |
| 실시간 통신       | STOMP, SockJS                           | `src/apis/sockets/`, `src/hooks/sockets/`      |
| 데이터 소스       | API·Session Repository                  | `src/repositories/`                            |
| 스타일·애니메이션 | Tailwind CSS 3, Framer Motion           | `src/components/`, `src/index.css`             |
| 오류 관측         | Sentry                                  | `src/instrument.ts`, `src/util/sentry.ts`      |
| 테스트·Story      | Vitest, Testing Library, MSW, Storybook | `setup.ts`, `src/mocks/`, `*.stories.tsx`      |

```text
main.tsx → Router → page → 기능 전용 UI·hooks → 공용 UI·hooks
                                  ├→ Query·Mutation → Repository 또는 도메인 API
                                  │                  └→ request<T> → Axios
                                  └→ 역할별 소켓 훅 → useSocket → SocketManager
```

화면 조립과 기능 상태는 `page/`에서 시작함. 재사용 UI와 훅은 `components/`,
`hooks/`에 있음. 공용 도메인 타입은 `src/types/`, 순수 계산·브라우저 경계는
`src/util/`에 있음. API 요청·응답 계약은 `src/apis/`의 전용 위치에 둠. 정확한
책임과 예외는 각 상세 문서가 소유함.

## 3. 아키텍처 상세 계약

| 문서                                                 | 읽을 때                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| [구조와 UI](architecture/structure-and-ui.md)        | 화면·공용 UI·훅·타입·유틸의 책임과 상태 소유권을 정할 때          |
| [앱·라우팅·국제화](architecture/app-routing-i18n.md) | 앱 초기화, Provider, 경로, 인증, 언어 동기화를 바꿀 때            |
| [데이터 접근](architecture/data-access.md)           | Axios, 도메인 API, Query·Mutation, Repository, MSW 흐름을 바꿀 때 |
| [실시간 통신](architecture/realtime.md)              | 소켓 연결·구독·검증·재연결·동기화를 바꿀 때                       |
| [오류와 관측](architecture/errors-observability.md)  | 지역 복구, ErrorBoundary, Sentry 수집·마스킹을 바꿀 때            |

## 4. 코드와 문서 컨벤션

| 문서                                                       | 소유하는 규칙                                    |
| ---------------------------------------------------------- | ------------------------------------------------ |
| [문서 작성](conventions/docs.md)                           | Markdown 형식, 길이, 문체, 중복, 링크·갱신       |
| [TypeScript·구조](conventions/typescript-and-structure.md) | 이름·선언·타입·파일 배치·주석                    |
| [React·UI](conventions/react-and-ui.md)                    | 컴포넌트·Props·훅·effect·스타일·국제화·접근성    |
| [데이터·실시간](conventions/data-and-realtime.md)          | Query·Mutation·API·MSW·Repository·소켓 작성 형식 |
| [테스트·Storybook](conventions/testing-and-storybook.md)   | TDD, 테스트·모킹·Story 작성 방식                 |

## 5. 스킬 워크플로

| 문서                                            | 읽을 때                                           |
| ----------------------------------------------- | ------------------------------------------------- |
| [코드 리뷰](workflows/dt-fe-code-review.md)     | PR·브랜치·diff를 검토하고 보고서를 작성할 때      |
| [일반 PR 생성](workflows/dt-fe-pull-request.md) | 작업 브랜치에서 `develop`으로 PR을 준비·생성할 때 |

## 6. 작업별 필수 읽기와 갱신

모든 코드 변경 전에 [헌법](CONSTITUTION.md)과 이 문서를 읽고, 아래에서 해당하는
상세 문서를 함께 읽음. 여러 행에 해당하면 모두 적용함.

| 작업                               | 읽을 상세 문서                                | 계약 변경 시 갱신할 문서                |
| ---------------------------------- | --------------------------------------------- | --------------------------------------- |
| 페이지·공용 UI·상태 훅             | 구조와 UI, React·UI, TypeScript·구조          | 구조와 UI 또는 React·UI                 |
| 라우트·인증·언어                   | 앱·라우팅·국제화, React·UI                    | 앱·라우팅·국제화                        |
| HTTP·Query·Mutation·Repository·MSW | 데이터 접근, 데이터·실시간, 테스트·Storybook  | 데이터 접근 또는 데이터·실시간          |
| 소켓·타이머 공유 상태              | 실시간 통신, 데이터·실시간, 테스트·Storybook  | 실시간 통신 또는 데이터·실시간          |
| 오류 UI·Sentry                     | 오류와 관측, React·UI, 테스트·Storybook       | 오류와 관측                             |
| 테스트·Story                       | 테스트·Storybook, 대상 기능의 아키텍처·컨벤션 | 테스트·Storybook 또는 대상 문서         |
| 문서·템플릿                        | 문서 작성, 이 문서, 관련 상세 문서            | 원칙 변경은 헌법, 계약 변경은 소유 문서 |
| 코드 리뷰·리뷰 보고서              | 코드 리뷰, 변경 영역의 상세 문서              | 코드 리뷰 또는 해당 상세 문서           |
| 일반 PR 준비·생성                  | 일반 PR 생성, 코드 리뷰, 문서 작성            | 일반 PR 생성 또는 코드 리뷰             |

표의 문서 이름은 3~5절의 링크를 가리킴. 정확히 일치하는 행이 없으면 변경 대상과
소비자를 기준으로 관련 문서를 선택함. 경로·기술·작업 분류가 바뀌면 이 문서의
지도와 읽기 표를 갱신함.

## 7. 현재 코드와 목표 규칙

상세 문서의 확정 규칙은 새 코드와 실질적으로 수정한 코드에 적용함. 일부 기존
코드는 함수 선언, 상수 이름, Props 구조분해, 버튼 이름, 테스트 함수 이름 등에서
확정 규칙과 다를 수 있음. 기존 예외를 새 규칙으로 해석하지 않음. 공용 도메인
타입의 `src/types/` 이동은 이 개편에서 함께 수행함. 규칙과 코드 경로가
달라졌다면 현재 상태와 목표를 구분해 해당 상세 문서를 수정함.
