---
description: Execute the TDD-driven implementation planning workflow to generate design artifacts including test contracts.
handoffs:
  - label: Create Tasks
    agent: speckits/tasks
    prompt: Break the plan into tasks
    send: true
  - label: Create Checklist
    agent: speckits/checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

### Step 1: Setup & Path Resolution

1. Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH.

   The script resolves the current branch name (e.g., `feat/#96-social-login`) to find the matching spec directory under `specs/feat/`.

   For single quotes in args, use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### Step 2: Load Context

1. Read FEATURE_SPEC (spec.md)
2. Read `.specify/memory/constitution.md` for project principles and tech stack
3. Read `CLAUDE.md` or `.claude/project-rules.md` if they exist for project conventions
4. Load IMPL_PLAN template (already copied by setup script)
5. Review `package.json` for current dependencies and scripts

### Step 3: Codebase Exploration

Before planning, explore the existing codebase to understand patterns:

1. **Scan existing pages**: List directories under `src/page/` to understand naming and structure patterns
2. **Check existing components**: List `src/components/` for reusable UI components
3. **Check existing hooks**: List `src/hooks/` including `query/` and `mutations/` subdirectories
4. **Check API layer**: List `src/apis/` to understand endpoint organization (apis/, requests/, responses/)
5. **Check utilities**: List `src/util/` and `src/constants/` for reusable helpers
6. **Note existing patterns**: Look at 1-2 existing pages to understand:
   - Page component structure (local `components/`, `hooks/` subdirectories)
   - How TanStack Query hooks wrap API calls
   - How Axios-based API functions are organized (`src/apis/primitives.ts`)
   - Compound component patterns (e.g., `DefaultLayout` with `Header.Left/Center/Right`)
   - Repository pattern usage (`src/repositories/`)
7. **Scan existing test patterns**: Look at existing `*.test.ts(x)` files to understand:
   - Test runner: Vitest (globals: true, jsdom environment)
   - Libraries: @testing-library/react, userEvent
   - Test file convention: `{module}.test.ts(x)` co-located with source
   - Test description style: Korean `describe`/`test` descriptions
   - MSW setup: `src/mocks/server.ts` for test, `src/mocks/handlers/` for mock data
   - Test setup: `setup.ts` (MSW server init, ResizeObserver mock, i18n config)

### Step 4: Execute Plan Workflow

1. **Fill Technical Context**:
   - Language: TypeScript (strict mode)
   - Framework: React 18 + Vite
   - Routing: React Router v7 (`createBrowserRouter`)
   - Server State: TanStack React Query 5
   - HTTP: Axios (custom `request<T>` primitive in `src/apis/primitives.ts`)
   - Styling: Tailwind CSS 3 + PostCSS
   - i18n: i18next + react-i18next
   - Animation: Framer Motion
   - Testing: Vitest + @testing-library/react + userEvent + MSW
   - Test approach: **TDD (Red-Green-Refactor)**
   - Storybook: Available for component documentation
   - Mark unknowns as "NEEDS CLARIFICATION"

2. **Constitution & Consistency Check** from `.specify/memory/constitution.md`:
   - Verify new code fits existing folder structure conventions
   - Verify API layer follows `src/apis/` patterns (endpoints, primitives, responses)
   - Verify hooks follow query/mutation separation pattern
   - Verify page structure follows local `components/` + `hooks/` pattern
   - Verify no circular dependencies between layers
   - Evaluate gates from constitution (ERROR if violations unjustified)

3. **Phase 0 — Outline & Research**:
   - Extract unknowns from Technical Context
   - For each unknown → research task
   - Consolidate findings in `research.md`:
     - Decision: [what was chosen]
     - Rationale: [why chosen]
     - Alternatives considered: [what else evaluated]

4. **Phase 1 — Design & Contracts (TDD-First)**:
   - Extract entities from spec → `data-model.md`
   - Generate API contracts from functional requirements:
     - For each user action → endpoint
     - Use REST patterns with Axios
     - Output to `/contracts/`
   - **Project Structure with Test Files**:
     ```
     src/
     ├── page/{PageName}/
     │   ├── {PageName}.tsx                    # Page component
     │   ├── {PageName}.test.tsx               # Page tests (TDD RED first)
     │   ├── components/                       # Page-local components
     │   │   ├── {Component}.tsx
     │   │   └── {Component}.test.tsx          # Component tests (TDD RED first)
     │   └── hooks/                            # Page-local hooks
     │       ├── use{Hook}.ts
     │       └── use{Hook}.test.ts             # Hook tests (TDD RED first)
     ├── components/{Component}/
     │   ├── {Component}.tsx                   # Reusable component
     │   └── {Component}.test.tsx              # Component tests (TDD RED first)
     ├── hooks/
     │   ├── query/use{Query}.ts               # TanStack Query hooks
     │   ├── query/use{Query}.test.ts          # Query hook tests (TDD RED first)
     │   ├── mutations/use{Mutation}.ts         # Mutation hooks
     │   ├── mutations/use{Mutation}.test.ts    # Mutation tests (TDD RED first)
     │   ├── use{Hook}.ts                      # Utility hooks
     │   └── use{Hook}.test.ts                 # Utility hook tests (TDD RED first)
     ├── apis/
     │   ├── apis/{domain}.ts                  # API functions (Axios)
     │   ├── apis/{domain}.test.ts             # API tests (TDD RED first, MSW)
     │   ├── requests/{domain}.ts              # Request type definitions
     │   └── responses/{domain}.ts             # Response type definitions
     ├── util/
     │   ├── {util}.ts                         # Utility functions
     │   └── {util}.test.ts                    # Utility tests (TDD RED first)
     ├── mocks/handlers/
     │   └── {domain}.ts                       # MSW handlers for new API
     └── type/
         └── type.ts                           # Shared type definitions
     ```
   - **Test Contract Design** — 각 모듈별 테스트 명세를 `test-contracts/`에 작성:
     - 모듈별 테스트 대상 행위(behavior) 목록
     - 각 행위에 대한 예상 입출력 및 경계 조건
     - 테스트 우선순위: `util/` (순수 함수) → `apis/` (API + MSW) → `hooks/` (query/mutation) → `components/` → `page/`
     - 테스트 설명은 한국어로 작성 (프로젝트 컨벤션)
     - mock 사용 최소화 — API mocking은 MSW handler로 (`src/mocks/handlers/`)

5. **TDD Implementation Order** — Red-Green-Refactor 사이클에 따른 구현 순서 설계:
   - 각 모듈별 **RED 단계** 테스트 목록을 순서대로 나열
   - 구현 순서 원칙:
     1. 타입 정의 (`type/`, `apis/requests/`, `apis/responses/`) — 데이터 구조 확정
     2. 순수 유틸리티 (`util/`) — 의존성 없어 테스트 가장 용이
     3. MSW 핸들러 (`mocks/handlers/`) — API mocking 준비
     4. API 함수 (`apis/apis/`) — MSW로 네트워크 mocking
     5. Query/Mutation hooks (`hooks/query/`, `hooks/mutations/`) — TanStack Query 래핑
     6. 페이지/컴포넌트 hooks (`page/{Page}/hooks/`) — 상태 및 비즈니스 로직
     7. UI 컴포넌트 (`components/`, `page/{Page}/components/`) — 위 모듈들을 조합
     8. 페이지 컴포넌트 (`page/{Page}/`) — 최종 조립
   - 각 단계에서 **테스트를 먼저 작성하고 실패를 확인한 후** 최소한의 코드만 구현
   - 구현 코드 없이 테스트만 먼저 존재하는 것이 정상 상태

6. **Architecture Decision Table**: For each decision, document:
   - Decision name
   - Options considered
   - Chosen option with rationale
   - Impact on project structure
   - Testability impact (테스트 용이성에 미치는 영향)

### Step 5: Stop & Report

Command ends after Phase 1 planning. Report:

- Branch name and spec path
- IMPL_PLAN path
- Generated artifacts (research.md, data-model.md, contracts/, test-contracts/)
- TDD implementation order summary (어떤 순서로 RED-GREEN-REFACTOR를 진행할지)
- Constitution & consistency check status
- Suggested next: `/speckits/tasks`

## Key Rules

- Use absolute paths
- ERROR on unresolved clarifications
- New code must follow existing project structure conventions
- API functions go in `src/apis/apis/`, types in `requests/` and `responses/`
- Query hooks in `src/hooks/query/`, mutations in `src/hooks/mutations/`
- Page-local components and hooks go inside the page directory
- Reusable components go in `src/components/`

### TDD Rules

- **테스트 먼저, 구현 나중**: 모든 기능 모듈에 대해 테스트 파일(`.test.ts(x)`)을 먼저 작성
- **Red-Green-Refactor 사이클 준수**: RED(실패하는 테스트) → GREEN(최소 구현) → REFACTOR(정리)
- **테스트가 실패하는 것을 반드시 확인**: 테스트가 즉시 통과하면 테스트가 잘못된 것
- **최소 구현**: GREEN 단계에서는 테스트를 통과하는 최소한의 코드만 작성
- **mock 최소화**: 순수 함수와 실제 코드를 우선 테스트, API는 MSW handler로 mocking
- **테스트 파일은 소스 파일과 co-locate**: `{module}.test.ts(x)` 형식으로 같은 디렉토리에 배치
- **테스트 설명은 한국어**: `describe`, `test` 설명을 한국어로 작성 (프로젝트 컨벤션)
- **구현 전 테스트 삭제 금지**: 테스트 없이 구현 코드를 먼저 작성한 경우, 해당 코드를 삭제하고 TDD로 재시작
- **Vitest globals**: `describe`, `test`, `expect` 등은 import 없이 사용 (vitest globals: true)
- **테스트 환경**: jsdom + `setup.ts`의 MSW server, ResizeObserver mock, i18n 설정 활용
