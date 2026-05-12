# Debate Timer FE

## Project Overview

토론 타이머 웹 애플리케이션 프론트엔드. 토론 테이블 구성, 타이머 실행, 투표 기능을 제공한다.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **Routing**: React Router v7 (`createBrowserRouter`)
- **Server State**: TanStack React Query 5
- **HTTP**: Axios (custom `request<T>` primitive in `src/apis/primitives.ts`)
- **Styling**: Tailwind CSS 3 + PostCSS
- **i18n**: i18next + react-i18next
- **Animation**: Framer Motion
- **Testing**: Vitest + @testing-library/react + userEvent + MSW
- **Storybook**: Available on port 6006

## Project Structure

```
src/
├── page/{PageName}/             # Page components (local components/ + hooks/)
├── components/{Component}/      # Reusable UI components
├── hooks/
│   ├── query/                   # TanStack Query hooks (useGet*)
│   ├── mutations/               # TanStack Mutation hooks (usePost*, usePatch*, useDelete*)
│   └── use{Hook}.ts             # Utility hooks
├── apis/
│   ├── apis/{domain}.ts         # API functions (Axios)
│   ├── requests/{domain}.ts     # Request types
│   ├── responses/{domain}.ts    # Response types
│   ├── primitives.ts            # Generic request<T> helper
│   ├── axiosInstance.ts         # Axios instance with interceptors
│   └── endpoints.ts             # API URL constants
├── util/                        # Utility functions
├── constants/                   # Constants and static data
├── type/                        # Shared TypeScript types
├── repositories/                # Repository pattern (API/Session)
├── mocks/handlers/              # MSW handlers
├── layout/                      # Layout components (DefaultLayout)
└── routes/routes.tsx            # Route definitions
```

## Code Conventions

- **Components**: function declaration (`export default function X() {}`), NOT arrow function const
- **Variables**: `const` default, `let` only for reassignment, NEVER `var`
- **Naming**: Components PascalCase, hooks `use` prefix camelCase, utils camelCase, constants UPPER_SNAKE_CASE
- **Boolean**: `is`/`has`/`should` prefix
- **Event handlers**: `handle` prefix
- **i18n**: All user-facing text via `useTranslation()`

## Testing (TDD)

- **Approach**: Red-Green-Refactor
- **Runner**: Vitest (globals: true, jsdom)
- **Setup**: `setup.ts` (MSW server, ResizeObserver mock, i18n)
- **Convention**: `{module}.test.ts(x)` co-located, Korean test descriptions
- **Mocking**: MSW for API, minimize other mocks
- **Order**: `util/` → `apis/` → `hooks/` → `components/` → `page/`

## Key Commands

```bash
npm run dev          # Development server
npm run dev-mock     # Dev with MSW API mocking
npm run build        # Production build
npm run test         # Run Vitest
npm run lint         # ESLint + Stylelint + TSC
npm run storybook    # Storybook on port 6006
```

## Speckits Workflow

This project uses the speckits specification workflow. Scripts are in `.specify/scripts/bash/` and templates in `.specify/templates/`.

Workflow order:
1. `/speckits/specify` — Create feature specification
2. `/speckits/clarify` — Clarify ambiguities in spec
3. `/speckits/plan` — Generate TDD-driven implementation plan
4. `/speckits/tasks` — Break plan into ordered tasks
5. `/speckits/analyze` — Cross-artifact consistency check
6. `/speckits/implement` — Execute tasks
7. `/speckits/checklist` — Generate quality checklist

Command definitions are in `.claude/commands/speckits/`. Constitution is at `.specify/memory/constitution.md`.

## Git Workflow

- Main branch: `develop`
- Feature branches: `feat/#{issue}-{slug}`
- PR target: `develop`
