# Tasks: 음소거 아이콘 헤더 반영 및 타이머 화면 레이아웃 개선

**Input**: Design documents from `/specs/fix/441-mute-timer-layout-fix/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, test-contracts/ ✅

**Tests**: TDD 방식 적용 — spec.md와 plan.md에 명시된 대로 테스트 먼저 작성(RED) 후 구현(GREEN)

**Organization**: 유저 스토리별로 태스크를 그룹화하여 독립적인 구현 및 테스트 가능

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 유저 스토리 (US1, US2, US3)
- 각 태스크에 정확한 파일 경로 포함

## Path Conventions

```
src/page/TimerPage/TimerPage.tsx                    → 음소거 아이콘 조건부 렌더링 (US1)
src/page/TimerPage/TimerPage.test.tsx               → TimerPage 테스트 (US1)
src/page/TimerPage/components/NormalTimer.tsx       → 두 줄 레이아웃 + text-center (US2, US3)
src/page/TimerPage/components/NormalTimer.test.tsx  → NormalTimer 테스트 (US2, US3)
src/mocks/handlers/                                 → MSW 핸들러 (기존, 필요 시 추가)
```

---

## Phase 1: Setup

**Purpose**: 테스트 환경 확인 및 MSW 핸들러 준비

- [x] T001 src/mocks/handlers/ 에서 debateTable 응답 MSW 핸들러 존재 여부 확인 — 없으면 TimerPage 테스트용 핸들러 추가

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 공통 인프라 확인

> 이 픽스는 순수 UI 레이어 수정이므로 추가 Foundational 작업 없음.
> 새로운 타입/엔티티 없음, API 변경 없음, `useTimerPageState` 인터페이스 변경 없음.

**⚠️ Foundational 단계 해당 없음**: Phase 1 완료 후 바로 User Story 구현 진행 가능

---

## Phase 3: User Story 1 - 음소거 아이콘 헤더 실시간 반영 (Priority: P1) 🎯 MVP

**Goal**: 헤더 볼륨 버튼이 `volume === 0` 조건에 따라 음소거/일반 아이콘을 즉시 전환

**Independent Test**: localStorage `timer-volume`을 0으로 설정 후 TimerPage를 렌더링하면 헤더에 음소거 아이콘이 표시되는지 확인

### TDD - RED 단계 (US1)

> **NOTE: 테스트를 먼저 작성하고 FAIL 확인 후 구현 진행**

- [x] T002 [US1] src/page/TimerPage/TimerPage.test.tsx 신규 작성 — test-contracts/TimerPage-mute-icon.md 기준: ① 볼륨 > 0 시 일반 볼륨 아이콘 표시 ② 볼륨 = 0 시 음소거 아이콘 표시 ③ VolumeBar에서 볼륨 변경 시 헤더 아이콘 즉시 업데이트 (MSW + MemoryRouter + localStorage 세팅 포함)

### TDD - GREEN 단계 (US1)

- [x] T003 [US1] src/page/TimerPage/TimerPage.tsx 수정 — `const isMuted = volume === 0;` 파생 추가, 헤더 볼륨 버튼 JSX에서 isMuted 조건으로 `RiVolumeMuteFill` (react-icons/ri) / `DTVolume` 조건부 렌더링

**Checkpoint**: T002 테스트 전부 PASS → US1 독립 동작 확인 후 다음 단계 진행

---

## Phase 4: User Story 2 - 팀 정보와 토론자 정보 두 줄 레이아웃 (Priority: P2)

**Goal**: NormalTimer에서 팀명과 토론자 정보가 각각 독립된 DOM 요소로 분리되어 별도 줄에 표시

**Independent Test**: `teamName = 'Negative team'`, `speaker = '발언자 1'`로 렌더링 시 팀명 요소와 토론자 요소가 각각 별도 DOM 노드로 존재하는지 확인

### TDD - RED 단계 (US2)

> **NOTE: 테스트를 먼저 작성하고 FAIL 확인 후 구현 진행**

- [x] T004 [US2] src/page/TimerPage/components/NormalTimer.test.tsx 신규 작성 — test-contracts/NormalTimer.md의 두 줄 레이아웃 항목 기준: ① 팀명만 있을 때 팀명 표시·토론자 줄 미렌더링 ② 토론자만 있을 때 토론자 표시·팀명 줄 미렌더링 ③ 둘 다 있을 때 각각 독립 DOM 요소 ④ 둘 다 없을 때 DTDebate 영역 전체 미렌더링 ⑤ 팀명 요소에 truncate 클래스 존재 ⑥ 토론자 요소에 truncate 클래스 미존재

### TDD - GREEN 단계 (US2)

- [x] T005 [US2] src/page/TimerPage/components/NormalTimer.tsx 수정 — 기존 단일 `<span className="...flex-row...">` 구조를 `flex-col`로 변경, 팀명을 `<p className="... truncate text-center">` 독립 태그로 분리, 토론자 정보를 `<p className="... text-center">` 독립 태그로 분리 (truncate 없음)

**Checkpoint**: T004 테스트 전부 PASS → US2 독립 동작 확인 후 다음 단계 진행

---

## Phase 5: User Story 3 - 토론 순서 제목 정렬 개선 (Priority: P3)

**Goal**: `<h1>` 순서명이 한글/영어 모두 동일한 중앙 정렬로 표시

**Independent Test**: 한글 순서명("교차질문및반박")과 영어 순서명("Opening Statement") 각각 렌더링 후 h1 요소에 `text-center` 클래스 존재 확인

### TDD - RED 단계 (US3)

> **NOTE: 테스트를 먼저 작성하고 FAIL 확인 후 구현 진행**

- [x] T006 [US3] src/page/TimerPage/components/NormalTimer.test.tsx에 US3 테스트 추가 — test-contracts/NormalTimer.md의 제목 렌더링 항목: ① 한글 순서명 렌더링 시 h1 요소에 `text-center` 클래스 존재 ② 영어 순서명 렌더링 시 h1 요소에 `text-center` 클래스 존재

### TDD - GREEN 단계 (US3)

- [x] T007 [US3] src/page/TimerPage/components/NormalTimer.tsx 수정 — h1 태그 className에 `text-center` 추가 (기존: `text-[52px] font-bold xl:text-[68px]` → `text-[52px] font-bold xl:text-[68px] text-center`)

**Checkpoint**: T006 테스트 전부 PASS → US3 독립 동작 확인 후 다음 단계 진행

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 리팩토링 및 최종 검증

- [x] T008 [P] src/page/TimerPage/TimerPage.tsx 불필요한 className 정리 — REFACTOR 단계 (plan.md 기준)
- [x] T009 [P] src/page/TimerPage/components/NormalTimer.tsx 불필요한 className 정리 — REFACTOR 단계 (space-x-[16px] 제거, flex-col 전환)
- [x] T010 전체 테스트 실행 (`pnpm test` 또는 `vitest run`) — TimerPage.test.tsx 및 NormalTimer.test.tsx 모든 케이스 GREEN 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 바로 시작 가능 — 의존성 없음
- **Foundational (Phase 2)**: 이 픽스에서 해당 없음
- **US1 (Phase 3)**: Phase 1 완료 후 시작
- **US2 (Phase 4)**: Phase 1 완료 후 시작 — US1과 **파일이 다르므로 병렬 진행 가능**
- **US3 (Phase 5)**: Phase 4 완료 후 시작 — NormalTimer.tsx / NormalTimer.test.tsx 파일 공유
- **Polish (Phase 6)**: US1 + US2 + US3 모두 완료 후

### User Story Dependencies

- **US1 (P1)**: T001 → T002(RED) → T003(GREEN) — `TimerPage.tsx` 단독 수정
- **US2 (P2)**: T001 → T004(RED) → T005(GREEN) — `NormalTimer.tsx` 단독 수정
- **US3 (P3)**: T004 완료 후 → T006(RED) → T007(GREEN) — `NormalTimer.tsx` 파일 공유 (US2 이후 순차 진행)

### 병렬 실행 가능 범위

- **US1과 US2**: 서로 다른 파일 수정 → 병렬 진행 가능
- **US2와 US3**: 동일 파일(NormalTimer.tsx, NormalTimer.test.tsx) 수정 → 순차 진행 필요
- **T008, T009 (Polish)**: 서로 다른 파일 → 병렬 가능

---

## Parallel Example: US1 + US2 병렬 진행

```bash
# Agent 1: US1 진행 (TimerPage 파일)
Task: "T002 [US1] src/page/TimerPage/TimerPage.test.tsx 신규 작성 (RED)"
Task: "T003 [US1] src/page/TimerPage/TimerPage.tsx 수정 (GREEN)"

# Agent 2: US2 진행 (NormalTimer 파일) — Agent 1과 동시 진행 가능
Task: "T004 [US2] src/page/TimerPage/components/NormalTimer.test.tsx 신규 작성 (RED)"
Task: "T005 [US2] src/page/TimerPage/components/NormalTimer.tsx 수정 (GREEN)"

# Agent 2가 US2 완료 후 US3 진행 (US3은 NormalTimer 파일 공유로 US2 이후 순차):
Task: "T006 [US3] NormalTimer.test.tsx에 US3 테스트 추가 (RED)"
Task: "T007 [US3] NormalTimer.tsx에 h1 text-center 추가 (GREEN)"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1 완료 (MSW 핸들러 확인)
2. Phase 3 완료 (US1: 음소거 아이콘) — 가장 명백한 버그 수정
3. **STOP and VALIDATE**: `TimerPage.test.tsx` 전부 PASS 확인
4. 필요 시 배포/데모

### Incremental Delivery

1. Phase 1 완료 → 테스트 환경 준비
2. Phase 3 완료 (US1) → 음소거 아이콘 버그 수정 ✅ **(MVP!)**
3. Phase 4 완료 (US2) → 두 줄 레이아웃 적용 ✅
4. Phase 5 완료 (US3) → 순서명 정렬 개선 ✅
5. Phase 6 완료 (Polish) → 리팩토링 마무리 ✅

### Parallel Team Strategy (2인 팀)

1. T001 — 함께 Setup 확인
2. Agent A: US1 (TimerPage) / Agent B: US2 (NormalTimer) — 동시 진행
3. Agent B가 US3 완료 후 Agent A와 합류 → Polish 병렬 진행

---

## Notes

- **TDD 원칙**: 각 구현(GREEN) 전 반드시 테스트(RED) 먼저 작성 및 FAIL 확인
- `[P]` 태스크 = 다른 파일, 의존성 없음 → 병렬 실행 가능
- US1과 US2는 다른 파일 수정으로 병렬 진행 가능 (효율 극대화)
- US2와 US3은 동일 파일(NormalTimer.tsx) 수정 → 순차 진행 필수
- 음소거 아이콘: `react-icons/ri`에서 `RiVolumeMuteFill` 사용 (기존 전체화면 토글 패턴 동일 방식)
- `isMuted` 파생: `TimerPage.tsx` 내 `const isMuted = volume === 0;` — `useTimerPageState` 인터페이스 변경 없음
- 각 Checkpoint에서 독립 테스트 실행 후 다음 단계 진행
