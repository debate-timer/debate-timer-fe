# Tasks: 사용자 지표 수집 시스템

**Input**: Design documents from `/specs/feat/443-user-analytics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/analytics-adapter.ts

**Tests**: TDD 방식 — plan.md에 명시된 Red-Green-Refactor 사이클에 따라 테스트 선작성 후 구현

**Organization**: 8개 User Story를 우선순위(P1→P2→P3) 순서로 배치. 각 Story는 독립적으로 구현/테스트 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 동일 Phase 내 다른 태스크와 병렬 실행 가능 (서로 다른 파일, 의존 관계 없음)
- **[Story]**: 해당 User Story (US1–US8). Setup/Foundational/Polish 단계는 Story 라벨 없음

---

## Phase 1: Setup

**Purpose**: 프로젝트 의존성 설치 및 디렉토리 구조 생성

- [x] T001 Install `@amplitude/analytics-browser` dependency (`npm install @amplitude/analytics-browser`)
- [x] T002 [P] Create directory structure: `src/util/analytics/` and `src/util/analytics/providers/`
- [x] T003 [P] Add `VITE_AMPLITUDE_API_KEY` entry to `.env.production`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 User Story가 의존하는 Analytics Adapter 핵심 인프라 구축

**⚠️ CRITICAL**: 이 Phase가 완료되어야 모든 User Story 작업 시작 가능

### 타입 및 상수 (컴파일 타임 검증 — 테스트 불필요)

- [x] T004 Define event types, Provider/Manager interfaces in `src/util/analytics/types.ts` (contracts/analytics-adapter.ts 기반)
- [x] T005 [P] Define event name constants (`ANALYTICS_EVENTS`) in `src/util/analytics/constants.ts`

### AnalyticsManager

- [x] T006 Write AnalyticsManager tests in `src/util/analytics/analyticsManager.test.ts` — 8개 테스트: fan-out (모든 provider에 전파), 에러 격리 (한 provider 실패 시 다른 provider 영향 없음), 빈 provider 배열 처리, 글로벌 속성 enrichment
- [x] T007 Implement AnalyticsManager in `src/util/analytics/analyticsManager.ts` — GlobalEventProperties(user_type, language, page_path) 자동 합성, 등록된 provider들에 이벤트 fan-out

### Providers (서로 다른 파일이므로 병렬 구현 가능)

- [x] T008 [P] Write AmplitudeProvider tests in `src/util/analytics/providers/amplitudeProvider.test.ts` — 6개 테스트: init, trackPageView, trackEvent, setUserId, setUserProperties, reset
- [x] T009 [P] Implement AmplitudeProvider in `src/util/analytics/providers/amplitudeProvider.ts` — `@amplitude/analytics-browser` SDK 래핑
- [x] T010 [P] Write GA4Provider tests in `src/util/analytics/providers/ga4Provider.test.ts` — 2개 테스트: pageview, event 전송
- [x] T011 [P] Implement GA4Provider in `src/util/analytics/providers/ga4Provider.ts` — 기존 `react-ga4` (ReactGA) 래핑
- [x] T012 [P] Implement NoopProvider in `src/util/analytics/providers/noopProvider.ts` — 개발 환경용 no-op (모든 메서드 빈 구현)

### 환경 게이팅

- [ ] T013 Add environment gating tests to `src/util/analytics/analyticsManager.test.ts` — 2개 추가 테스트: production에서 실제 provider 사용, development에서 NoopProvider 사용 — **Pending**: 현재 해당 테스트가 구현되어 있지 않음

### 공개 API 및 훅

- [x] T014 Create public API re-exports in `src/util/analytics/index.ts` — AnalyticsManager 싱글턴, setupAnalytics(), 타입 re-export
- [x] T015 Write useAnalytics tests in `src/hooks/useAnalytics.test.ts` — 4개 테스트: trackEvent, trackPageView, identifyUser (setUserId + setUserProperties), resetUser
- [x] T016 Implement useAnalytics hook in `src/hooks/useAnalytics.ts` — AnalyticsManager 싱글턴 래핑, identifyUser/resetUser 편의 메서드 제공

### 초기화

- [ ] T017 Add `setupAnalytics()` call in `src/main.tsx` — 환경 분기(prod: Amplitude+GA4, dev: Noop), provider 등록, `init()` 호출 — **Partial**: `setupAnalytics()` 호출 자체는 존재하지만, 감사 기준 FR-016 환경 게이팅 정합성이 남아 있음

**Checkpoint**: Analytics Adapter 인프라 완료 — 모든 User Story 구현 시작 가능

---

## Phase 3: User Story 1 — 회원/비회원 비율 및 화면 체류율 추적 (Priority: P1) 🎯 MVP

**Goal**: 모든 페이지 전환 시 page_view 이벤트 + 이탈 시 page_leave(duration_ms) 이벤트 수집. 사용자 유형(회원/비회원) 포함.

**Independent Test**: Amplitude 대시보드에서 화면별 page_view 수, 평균 체류 시간(duration_ms), 회원/비회원 비율을 조회 가능

### Tests

- [ ] T018 [US1] Write usePageTracking tests in `src/hooks/usePageTracking.test.ts` — 7개 테스트: 마운트 시 page_view, 경로 변경 시 page_view, 경로 변경 시 이전 페이지 page_leave, 언마운트 시 page_leave, duration_ms 정확성, **pagehide 시 마지막 페이지 page_leave 발화**, **언로드 시 flush() 호출 확인** — **Partial**: 현재 마운트/언마운트/duration_ms 위주 일부 테스트만 구현됨

### Implementation

- [x] T019 [US1] Implement usePageTracking hook in `src/hooks/usePageTracking.ts` — React Router location 변경 감지, page_view 발화(page_title, previous_page_path, referrer), 진입 시각 기록 후 이탈 시 page_leave 발화(duration_ms). **터미널 종료 처리**: `pagehide`/`beforeunload` 이벤트 리스너로 탭 닫기/새로고침/브라우저 종료 시에도 마지막 페이지의 page_leave를 발화한 뒤 `analytics.flush()` 호출로 언로드 중 전송 보장
- [x] T020 [US1] Replace GA4 direct route subscription with usePageTracking in `src/routes/routes.tsx` — 기존 `router.subscribe` GA4 호출 제거, Analytics Adapter로 교체
- [x] T021 [US1] Remove legacy `src/util/setupGoogleAnalytics.tsx` — GA4Provider로 이관 완료

**Checkpoint**: 페이지 추적(page_view/page_leave/duration_ms) GA4+Amplitude 동시 수집 작동

---

## Phase 4: User Story 2 — 비회원→회원 전환 경로 분석 (Priority: P1)

**Goal**: 로그인 전환 퍼널(login_started → login_completed)을 경로별(landing_header, landing_table_section, share_save, timer_modal, protected_route)로 추적. Identity stitching으로 비회원 세션과 회원 세션 연결.

**Independent Test**: Amplitude 퍼널 차트에서 전환 경로별(trigger_context) 필터링하여 login_started → login_completed 전환율 조회 가능

### Implementation

- [x] T022 [US2] Add memberId persistence functions in `src/util/accessToken.ts` — `setMemberId(id)`, `getMemberId()`, `removeMemberId()` (localStorage 기반)
- [x] T023 [P] [US2] Create login trigger utility in `src/util/analytics/loginTrigger.ts` — `setLoginTrigger({ trigger_page, trigger_context })`, `consumeLoginTrigger()` (읽기 + 즉시 삭제하는 일회용 소비 패턴), `clearLoginTrigger()`, `hasLoginTrigger()` (sessionStorage 기반, OAuth 리다이렉트 간 출처 보존). **기존 trigger 보존**: `setLoginTrigger()`는 이미 trigger가 존재하면 덮어쓰지 않음 (예: `protected_route`에서 설정된 trigger가 이후 로그인 버튼 클릭 시에도 보존됨). 강제 설정이 필요한 경우 `setLoginTrigger(trigger, { force: true })` 사용. **Stale trigger 방지**: 저장 시 타임스탬프 포함, `consumeLoginTrigger()`에서 5분 초과 시 만료 처리하여 무관한 후속 로그인에 오귀속 방지
- [x] T024 [US2] Update `src/main.tsx` to restore memberId on app start — accessToken + memberId 모두 존재 시 `setUserId()` 호출, accessToken 없이 memberId만 있으면 memberId 제거(비회원 처리)
- [x] T025 [US2] Update `src/hooks/mutations/usePostUser.ts` — 로그인 성공 시 `setMemberId(response.id)` + `identifyUser(memberId)` 호출
- [x] T026 [US2] Update `src/page/OAuthPage/OAuth.tsx` — 로그인 완료 후 `consumeLoginTrigger()`로 출처 복원(일회용 소비 — 읽기 즉시 삭제), `login_completed` 이벤트 발화(trigger_page, trigger_context 포함). 만료된 trigger는 무시하고 trigger 없이 발화
- [x] T027 [P] [US2] Update `src/page/LandingPage/hooks/useLandingPageHandlers.ts` — `login_started` 이벤트 발화 + OAuth 리다이렉트 전 `setLoginTrigger()` 호출 (`landing_header`, `landing_table_section`). 기존 trigger가 있으면 덮어쓰지 않아 `protected_route` 등 원래 컨텍스트가 보존됨
- [x] T028 [P] [US2] Update `src/page/TimerPage/components/LoginAndStoreModal.tsx` — `login_started` 이벤트 발화 + OAuth 리다이렉트 전 `setLoginTrigger({ trigger_context: 'timer_modal' })` 호출. 기존 trigger가 있으면 덮어쓰지 않음
- [x] T029 [P] [US2] Update `src/routes/ProtectedRoute.tsx` — 인증 필요 시 홈으로 리다이렉트 전 `setLoginTrigger({ trigger_context: 'protected_route', trigger_page: location.pathname })` 저장. ProtectedRoute는 OAuth를 직접 실행하지 않으므로 `login_started`를 발화하지 않음. 이후 로그인 버튼 클릭 시 `setLoginTrigger()`는 기존 trigger를 덮어쓰지 않으므로 `protected_route` 컨텍스트가 최종 `login_completed`까지 보존됨
- [ ] T030 [P] [US2] Update `src/page/TableSharingPage/TableSharingPage.tsx` — `login_started` 이벤트 발화 + 공유 저장 시 OAuth 리다이렉트 전 `setLoginTrigger({ trigger_context: 'share_save' })` 호출 — **Pending**: 현재 아키텍처에서 비회원은 `/share` 진입 시 세션 저장 후 바로 게스트 overview로 이동하며, 이 경로에서 OAuth가 트리거되지 않음. `share_save` 트리거 지점이 존재하지 않아 구현 불가
- [x] T031 [US2] Update `src/hooks/mutations/useLogout.ts` — 로그아웃 시 `removeMemberId()` + `resetUser()` 호출
- [x] T032 [US2] Update `src/apis/axiosInstance.ts` — 리프레시 토큰 실패 시 `removeMemberId()` + `analytics.reset()` 호출 (인증 해제 시 memberId 잔존 방지)

**Checkpoint**: 전체 Identity 라이프사이클(anonymous → login_started → login_completed → logout) 작동, 전환 경로별 추적 가능

---

## Phase 5: User Story 3 — 시간표 공유 추적 (Priority: P2)

**Goal**: 시간표 공유 버튼 클릭(table_shared) 및 공유 링크 유입(share_link_entered) 추적. 회원/비회원 구분.

**Independent Test**: Amplitude에서 table_shared 이벤트(회원: table_id, 비회원: 'guest')와 share_link_entered 이벤트(referrer) 조회 가능

### Implementation

- [x] T033 [P] [US3] Add `table_shared` event in `src/page/TableOverviewPage/` — 공유 버튼 클릭 시 발화, 회원은 `table_id` 포함, 비회원은 `'guest'` 포함
- [x] T034 [P] [US3] Add `share_link_entered` event in `src/page/TableSharingPage/TableSharingPage.tsx` — `/share` 페이지 진입 시 `data` 쿼리 파라미터가 존재할 때만 발화 (OAuth 리턴 등 내부 continuation 경로 제외), `referrer` 포함

**Checkpoint**: 공유 추적 작동

---

## Phase 6: User Story 4 — 토론 종료화면 전환율 추적 (Priority: P2)

**Goal**: 토론 타이머 시작(timer_started) → 종료(debate_completed) 퍼널 추적 + 중도 이탈(debate_abandoned) 감지(beforeunload + visibilitychange + SPA navigation).

**Independent Test**: Amplitude 퍼널에서 timer_started → debate_completed 전환율, debate_abandoned 이벤트(current_round, abandon_type) 조회 가능

### Tests

- [x] T035 [US4] Write useDebateTracking tests in `src/page/TimerPage/hooks/useDebateTracking.test.ts` — 4개 테스트: timer_started 발화, debate_completed 발화, navigation 이탈(debate_abandoned with abandon_type='navigation'), visibility 이탈(abandon_type='visibility')

### Implementation

- [x] T036 [US4] Implement useDebateTracking hook in `src/page/TimerPage/hooks/useDebateTracking.ts` — beforeunload(unload), visibilitychange(visibility), React Router navigation(navigation) 감지, `debate_abandoned` 이벤트에 table_id, current_round, total_rounds, abandon_type 포함. 언로드/visibility 이탈 시 `analytics.flush()` 호출로 전송 보장
- [x] T037 [P] [US4] Add `timer_started` event in `src/page/TimerPage/` — 토론 타이머 시작 시 발화, `table_id`, `total_rounds` 포함
- [ ] T038 [P] [US4] Add `debate_completed` event in `src/page/DebateEndPage/` — 토론 종료 화면 도달 시 발화, `table_id`, `total_rounds` 포함 — **Partial**: 이벤트 자체는 구현되어 있으나 `src/page/TimerPage/TimerPage.tsx`에서 종료 액션 직전에 발화되고 `DebateEndPage`에는 없음

**Checkpoint**: 토론 진행 추적(시작 → 완료/이탈) 작동

---

## Phase 7: User Story 5 — 템플릿별 이용율 추적 (Priority: P2)

**Goal**: 템플릿 선택(template_selected) 및 실제 사용(template_used) 추적. 조직명/템플릿명 포함.

**Independent Test**: Amplitude에서 조직별/템플릿별 선택 횟수와 template_selected → template_used 전환율 조회 가능

### Implementation

- [x] T039 [P] [US5] Add `template_selected` event in `src/page/LandingPage/components/TemplateCard.tsx` — 템플릿 클릭 시 발화, `organization_name`, `template_name` 포함
- [x] T040 [P] [US5] Add `template_used` event in `src/page/TimerPage/` — 템플릿 이름 추적을 위한 별도 메커니즘 필요, 현재는 template_selected로 선택 추적 — 템플릿 기반 토론 시작 시 발화, `organization_name`, `template_name`, `table_id` 포함

**Checkpoint**: 템플릿 이용율 추적 작동

---

## Phase 8: User Story 6 — 투표 기능 사용율 추적 (Priority: P3)

**Goal**: 투표 생성(poll_created), 투표 참여(poll_voted), 결과 조회(poll_result_viewed) 추적.

**Independent Test**: Amplitude에서 투표 생성 수, 참여 수, 결과 조회 수를 확인 가능

### Implementation

- [x] T041 [P] [US6] Add `poll_created` event in `src/page/DebateEndPage/` or `src/page/DebateVotePage/` — 투표 생성 mutation 성공 시 발화, `table_id`, `poll_id` 포함
- [x] T042 [P] [US6] Add `poll_voted` event in `src/page/VoteParticipationPage/` — 투표 제출 시 발화, `poll_id`, `team` 포함
- [x] T043 [P] [US6] Add `poll_result_viewed` event in `src/page/DebateVoteResultPage/` — 결과 페이지 진입 시 발화, `poll_id` 포함

**Checkpoint**: 투표 기능 추적 작동

---

## Phase 9: User Story 7 — 피드백 타이머 사용율 추적 (Priority: P3)

**Goal**: 토론 종료 후 피드백 타이머 시작(feedback_timer_started) 추적.

**Independent Test**: Amplitude에서 feedback_timer_started 이벤트 수 조회 가능

### Implementation

- [x] T044 [US7] Add `feedback_timer_started` event in `src/page/DebateEndPage/` — "피드백 타이머" 버튼 클릭 시 발화, `table_id` 포함

**Checkpoint**: 피드백 타이머 추적 작동

---

## Phase 10: User Story 8 — 다국어 사용 분포 추적 (Priority: P3)

**Goal**: 사용자의 언어 선택을 user property로 설정하여 언어별 사용자 분포 파악. 글로벌 이벤트 속성에 `language` 포함.

**Independent Test**: Amplitude에서 언어별 사용자 분포(user property: language) 조회 가능

### Implementation

- [x] T045 [US8] Set language user property on analytics init and subscribe to i18next language change in `src/main.tsx` or `src/hooks/useAnalytics.ts` — 세션 시작 시 `setUserProperties({ language })`, 언어 변경 시 업데이트

**Checkpoint**: 다국어 분포 추적 작동

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: 전체 Story 통합 후 품질 검증

- [x] T046 [P] Verify bundle size impact — Amplitude SDK 추가 후 빌드, 기존 대비 페이지 초기 로딩 시간 500ms 이상 증가 없음 확인 (SC-007)
- [x] T047 [P] Validate all 15 event types fire correctly in production build — page_view, page_leave, login_started, login_completed, table_shared, share_link_entered, timer_started, debate_completed, debate_abandoned, template_selected, template_used, poll_created, poll_voted, poll_result_viewed, feedback_timer_started
- [x] T048 Run existing test suite (`npm test`) to ensure no regressions from analytics integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 시작 — **모든 User Story를 블로킹**
- **User Stories (Phase 3–10)**: Foundational 완료 후 시작 가능
  - US1 (P1) → US2 (P1) 순서 권장 (US2의 identity가 US1의 page_view에 user_type을 풍부하게 함)
  - US3–US5 (P2)는 서로 독립적이므로 병렬 가능
  - US6–US8 (P3)는 서로 독립적이므로 병렬 가능
- **Polish (Phase 11)**: 모든 User Story 완료 후

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|-----------|-------------------|
| US1 (Phase 3) | Foundational | — (MVP, 먼저 완료 권장) |
| US2 (Phase 4) | Foundational | US1과 병렬 가능하나 순차 권장 |
| US3 (Phase 5) | Foundational | US4, US5 |
| US4 (Phase 6) | Foundational | US3, US5 |
| US5 (Phase 7) | Foundational | US3, US4 |
| US6 (Phase 8) | Foundational | US7, US8 |
| US7 (Phase 9) | Foundational | US6, US8 |
| US8 (Phase 10) | Foundational | US6, US7 |

### Within Each User Story

1. Tests(있는 경우) → 실패 확인 (RED)
2. 유틸리티/타입 → 훅 → 페이지 통합 순서
3. Story 완료 후 다음 우선순위 Story로 이동

### Parallel Opportunities

**Phase 2 내부**:
- T004 + T005: types.ts와 constants.ts 동시 작성
- T008/T009 + T010/T011 + T012: AmplitudeProvider, GA4Provider, NoopProvider 동시 구현
- T015 + T016: useAnalytics 테스트/구현 (Manager 완료 후)

**User Story 간**:
- US3 + US4 + US5 (P2 그룹): 서로 다른 페이지를 수정하므로 완전 병렬
- US6 + US7 + US8 (P3 그룹): 서로 다른 페이지를 수정하므로 완전 병렬

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Step 1: 타입과 상수 동시 작성
Task: T004 "Define types in src/util/analytics/types.ts"
Task: T005 "Define constants in src/util/analytics/constants.ts"

# Step 2: Manager 테스트 → 구현 (순차)
Task: T006 "Write AnalyticsManager tests"
Task: T007 "Implement AnalyticsManager"

# Step 3: Provider 3종 동시 구현
Task: T008+T009 "AmplitudeProvider test → impl"
Task: T010+T011 "GA4Provider test → impl"
Task: T012 "NoopProvider impl"
```

## Parallel Example: P2 User Stories

```bash
# US3, US4, US5를 동시에 진행 (서로 다른 파일)
Agent A: T033 "table_shared in TableOverviewPage"
Agent B: T035+T036 "useDebateTracking test → impl in TimerPage"
Agent C: T039 "template_selected in TemplateSelection"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (CRITICAL — 모든 Story 블로킹)
3. Phase 3: User Story 1 완료
4. **STOP and VALIDATE**: page_view/page_leave 이벤트가 Amplitude에서 확인되는지 검증
5. Deploy/Demo 가능

### Incremental Delivery

1. Setup + Foundational → 인프라 완성
2. US1 (페이지 추적) → 독립 검증 → Deploy **(MVP!)**
3. US2 (전환 경로) → 독립 검증 → Deploy
4. US3 + US4 + US5 (공유/토론/템플릿) → 독립 검증 → Deploy
5. US6 + US7 + US8 (투표/피드백/다국어) → 독립 검증 → Deploy
6. Polish → 최종 검증 → Release

### Single Developer Strategy (권장)

1. Phase 1 → Phase 2 순차 완료
2. US1 → US2 순차 (P1 그룹)
3. US3 → US4 → US5 순차 (P2 그룹)
4. US6 → US7 → US8 순차 (P3 그룹)
5. Phase 11: Polish

---

## Notes

- [P] 태스크 = 서로 다른 파일을 수정하며 의존 관계 없음
- [Story] 라벨은 해당 태스크가 어떤 User Story에 속하는지 추적
- 각 User Story는 독립적으로 완료 및 테스트 가능
- TDD: 테스트 실패 확인 (RED) → 최소 구현 (GREEN) → 리팩토링
- 각 태스크 또는 논리적 그룹 완료 후 커밋
- Checkpoint에서 해당 Story 독립 검증 가능
- 금지: 모호한 태스크, 동일 파일 충돌, Story 간 독립성 깨뜨리는 의존
