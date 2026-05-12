# Debate Timer FE Constitution

## Core Principles

### I. Layered Folder Structure

모든 코드는 기능별 폴더 구조를 따른다. 각 레이어는 명확한 책임을 가진다.

- **page/**: 페이지 단위 컴포넌트. 각 페이지는 로컬 `components/`, `hooks/` 하위 디렉토리를 가진다.
- **components/**: 페이지 간 재사용 가능한 UI 컴포넌트. 폴더 단위로 관리.
- **hooks/**: 공유 커스텀 훅.
  - `query/` — TanStack Query 래핑 (useGet*)
  - `mutations/` — TanStack Mutation 래핑 (usePost*, usePatch*, useDelete*)
  - 루트 — 유틸리티 훅 (useModal, useMobile 등)
- **apis/**: API 통신 레이어.
  - `apis/` — Axios 기반 API 함수
  - `requests/` — 요청 타입 정의
  - `responses/` — 응답 타입 정의
  - `primitives.ts` — 공통 `request<T>` 헬퍼
  - `axiosInstance.ts` — Axios 인스턴스 (인터셉터, 인증)
  - `endpoints.ts` — API URL 상수
- **util/**: 순수 유틸리티 함수
- **constants/**: 상수 및 정적 데이터
- **type/**: 공유 TypeScript 타입 정의
- **repositories/**: Repository 패턴 구현 (API/Session 추상화)
- **mocks/handlers/**: MSW 핸들러 (API mocking)
- **layout/**: 레이아웃 컴포넌트 (DefaultLayout + Compound Component 패턴)

### II. Consistent Code Style

일관된 코드 작성 규칙을 프로젝트 전체에 적용한다.

- **컴포넌트**: function declaration 사용 (`export default function Component() {}`), arrow function const 금지.
- **변수 선언**: `const` 기본, 재할당 필요 시에만 `let`, `var` 절대 금지.
- **네이밍**: 변수/함수 camelCase, 컴포넌트 PascalCase, 상수 UPPER_SNAKE_CASE.
- **Boolean**: `is`/`has`/`should` 접두사 (e.g., `isLoading`, `hasError`).
- **이벤트 핸들러**: `handle` 접두사 (e.g., `handleSubmit`).
- **커스텀 훅**: `use` 접두사 (e.g., `useTimerPageState`).
- **파일명**: 컴포넌트 PascalCase, 훅 camelCase(`use` prefix), 유틸 camelCase.

### III. TDD (Test-Driven Development)

모든 기능 구현은 TDD 방식을 따른다.

- **Red-Green-Refactor 사이클**: 실패하는 테스트 → 최소 구현 → 리팩토링.
- **테스트 먼저**: 구현 코드보다 테스트를 먼저 작성한다.
- **테스트 파일 co-location**: `{module}.test.ts(x)` 형식으로 소스 파일과 같은 디렉토리에 배치.
- **테스트 설명은 한국어**: `describe`, `test` 설명을 한국어로 작성.
- **mock 최소화**: 순수 함수와 실제 코드를 우선 테스트. API만 MSW로 mocking.
- **구현 순서**: `util/` → `apis/` → `hooks/` → `components/` → `page/`
- **Vitest globals**: import 없이 `describe`, `test`, `expect` 사용 가능.

### IV. i18n First

모든 사용자 대면 텍스트는 i18next를 통해 관리한다.

- `useTranslation()` 훅으로 번역 키 사용.
- 하드코딩된 한국어 텍스트 금지.
- 기본 언어: ko (한국어).

## Technology Stack

| Category        | Technology                                        |
| --------------- | ------------------------------------------------- |
| Framework       | React 18 + Vite                                   |
| Language        | TypeScript (strict mode)                          |
| Routing         | React Router v7 (createBrowserRouter)             |
| Server State    | TanStack React Query 5                            |
| HTTP Client     | Axios (custom request primitive)                  |
| Styling         | Tailwind CSS 3 + PostCSS                          |
| i18n            | i18next + react-i18next                           |
| Animation       | Framer Motion                                     |
| Icons           | React Icons                                       |
| Testing         | Vitest + @testing-library/react + userEvent + MSW |
| Storybook       | Storybook (port 6006)                             |
| Linting         | ESLint + Stylelint + Prettier                     |
| Analytics       | Google Analytics (ReactGA)                        |
| Package Manager | npm                                               |

## Development Workflow

### Feature 생성 절차

1. `src/page/` 아래에 PascalCase 이름으로 페이지 디렉토리 생성
2. 페이지 내 `components/`, `hooks/` 하위 디렉토리 구성 (필요 시)
3. 필요 시 `src/apis/apis/`에 API 함수, `src/apis/requests/` + `responses/`에 타입 정의 추가
4. TanStack Query 훅을 `src/hooks/query/` 또는 `src/hooks/mutations/`에 추가
5. 재사용 컴포넌트는 `src/components/`에 배치
6. 라우트를 `src/routes/routes.tsx`에 등록

### Quality Gates

- **ESLint + Stylelint**: 코드 품질 및 스타일 검사
- **TypeScript**: `tsc --noEmit`으로 타입 체크
- **Vitest**: TDD 방식의 단위/통합 테스트
- **Storybook**: 컴포넌트 문서화 및 시각적 검증

## Governance

- 이 Constitution은 프로젝트의 모든 코드 작성 및 리뷰의 기준이 된다.
- 아키텍처 결정이 불명확할 경우, 코드 작성 전 팀원과 논의한다.
- Constitution 변경 시 팀 합의 및 문서 업데이트가 필요하다.

**Version**: 2.0.0 | **Ratified**: 2026-02-13 | **Last Amended**: 2026-03-31
