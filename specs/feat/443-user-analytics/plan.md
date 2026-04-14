# Implementation Plan: 사용자 지표 수집 시스템

**Branch**: `feat/#443-user-analytics` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feat/443-user-analytics/spec.md`

## Summary

GA4와 Amplitude에 동시 전송하는 분석 추상화 계층(Analytics Adapter)을 구축하고, 사용자 행동 이벤트(페이지뷰, 회원 전환, 공유, 토론 진행, 템플릿, 투표, 피드백 타이머, 다국어) 15종을 트래킹한다. Amplitude는 무료 Starter 플랜으로 구현하며, 추후 GA4 제거 시 설정 변경만으로 이관 가능한 구조이다.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Framework**: React 18 + Vite 6
**Routing**: React Router v7 (`createBrowserRouter`)
**Server State**: TanStack React Query 5
**HTTP Client**: Axios (custom `request<T>` primitive)
**Styling**: Tailwind CSS 3 + PostCSS
**i18n**: i18next + react-i18next
**Testing**: Vitest 4 + @testing-library/react 16 + userEvent 14 + MSW 2
**Analytics (existing)**: react-ga4 (GA4 페이지뷰만 수집 중)
**Analytics (new)**: `@amplitude/analytics-browser` (Browser SDK 2)
**Target Platform**: Web (SPA)
**Project Type**: Web (frontend only)
**Performance Goals**: 페이지 초기 로딩 시간 기존 대비 500ms 이상 증가 금지 (SC-007)
**Constraints**: 프로덕션 환경에서만 활성화 (FR-016), Amplitude 무료 Starter 플랜

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate | Status | Notes |
|------|--------|-------|
| Layered Folder Structure | PASS | `src/util/analytics/` (어댑터), `src/hooks/` (훅) — 기존 레이어 구조 준수 |
| Consistent Code Style | PASS | function declaration, camelCase 변수, PascalCase 컴포넌트, `use` 접두사 훅 |
| TDD | PASS | test-contracts 작성 완료, Red-Green-Refactor 사이클 준수 예정 |
| i18n First | N/A | 분석 이벤트는 사용자 대면 텍스트가 아님. 다국어 속성은 이벤트 프로퍼티로 수집 |
| No circular dependencies | PASS | analytics → (독립), hooks → analytics, page → hooks 단방향 |

**Re-check after Phase 1**: PASS — 모든 게이트 통과

## Project Structure

### Documentation (this feature)

```text
specs/feat/443-user-analytics/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Event taxonomy & data model
├── contracts/
│   └── analytics-adapter.ts  # TypeScript interface contracts
├── test-contracts/
│   └── analytics.md     # Test contracts per module
└── tasks.md             # (Phase 2 — /speckits:tasks)
```

### Source Code (repository root)

```text
src/
├── util/
│   └── analytics/
│       ├── index.ts                    # 공개 API (re-export)
│       ├── analyticsManager.ts         # AnalyticsManager 구현
│       ├── analyticsManager.test.ts    # Manager 테스트
│       ├── types.ts                    # 이벤트 타입 정의
│       ├── constants.ts                # 이벤트 이름 상수
│       └── providers/
│           ├── amplitudeProvider.ts     # Amplitude SDK 래퍼
│           ├── amplitudeProvider.test.ts
│           ├── ga4Provider.ts           # GA4 (ReactGA) 래퍼
│           ├── ga4Provider.test.ts
│           └── noopProvider.ts          # 개발 환경용 no-op
├── hooks/
│   ├── useAnalytics.ts                 # 분석 이벤트 발화 훅
│   ├── useAnalytics.test.ts
│   ├── usePageTracking.ts              # 라우트 변경 시 page_view 자동 발화
│   └── usePageTracking.test.ts
├── page/
│   └── TimerPage/
│       └── hooks/
│           ├── useDebateTracking.ts     # 토론 진행/이탈 추적 훅
│           └── useDebateTracking.test.ts
└── main.tsx                             # analytics init 호출 추가
```

**기존 파일 수정**:
- `src/main.tsx` — `setupAnalytics()` 호출 추가
- `src/routes/routes.tsx` — `LanguageWrapper` 라우트 연결
- `src/routes/LanguageWrapper.tsx` — `usePageTracking()` 통합으로 라우트 추적 연결
- `src/page/OAuthPage/OAuth.tsx` — 로그인 완료 시 `identifyUser()` 호출 + `sessionStorage`에서 로그인 출처(`login_trigger`)를 복원하여 `login_completed` 이벤트에 `trigger_page`/`trigger_context` 포함 후 제거
- `src/page/LandingPage/hooks/useLandingPageHandlers.ts` — `login_started` 이벤트 + OAuth 리다이렉트 전 `sessionStorage`에 `login_trigger` 저장
- `src/page/TimerPage/components/LoginAndStoreModal.tsx` — 로그인 모달에서 OAuth 리다이렉트 전 `sessionStorage`에 `login_trigger` 저장
- `src/routes/ProtectedRoute.tsx` — 인증 필요 리다이렉트 전 `sessionStorage`에 `login_trigger` 저장
- `src/page/LandingPage/components/TemplateSelection.tsx` — `template_selected` 이벤트
- `src/page/TableOverviewPage/` — `table_shared` 이벤트
- `src/page/TableSharingPage/` — `share_link_entered` 이벤트
- `src/page/TimerPage/` — `timer_started`, `debate_abandoned` 이벤트
- `src/util/analytics/templateOrigin.ts` — 템플릿 진입 컨텍스트 저장/복원
- `src/page/DebateEndPage/` — `feedback_timer_started`, `poll_created` 이벤트
- `TODO`: `debate_completed`는 `DebateEndPage`가 아니라 `src/page/TimerPage/TimerPage.tsx`에서 종료 액션 직전에 발화
- `src/page/DebateVotePage/` — `poll_created` 이벤트
- `src/page/VoteParticipationPage/` — `poll_voted` 이벤트
- `src/page/DebateVoteResultPage/` — `poll_result_viewed` 이벤트
- `src/hooks/mutations/usePostUser.ts` — 로그인 성공 시 memberId 저장 + identity 설정
- `src/hooks/mutations/useLogout.ts` — 로그아웃 시 `resetUser()` 호출
- `src/util/accessToken.ts` — memberId 저장/조회 함수 추가

**Structure Decision**: 기존 `src/util/` 하위에 `analytics/` 디렉토리 생성. Analytics는 순수 유틸리티이므로 `util/` 레이어에 배치. Provider 패턴으로 각 SDK를 캡슐화. 훅은 기존 `src/hooks/`에 배치하여 컴포넌트에서 쉽게 사용.

## Architecture Decision Table

| Decision | Options Considered | Chosen | Rationale | Testability Impact |
|----------|-------------------|--------|-----------|-------------------|
| 분석 도구 | GA4 단독 / Amplitude 단독 / GA4+Amplitude 병행 | GA4+Amplitude 병행 | FR-014: 이중 전송으로 마이그레이션 리스크 최소화 | Provider 각각 독립 테스트 가능 |
| Amplitude 플랜 | Free Starter / Plus ($49/월) | **Free Starter** | 50K MTU + identity stitching + 커스텀 이벤트 모두 무료. 현재 서비스 규모에 충분 | 플랜에 관계없이 SDK 동일 |
| 추상화 패턴 | 직접 SDK 호출 / Adapter Pattern / CDP (Segment) | Adapter Pattern | 도구 교체 시 코드 변경 최소화, 추가 비용 없음 | Mock provider로 테스트 용이 |
| SDK 선택 | amplitude-js (legacy) / @amplitude/analytics-browser / @amplitude/unified | @amplitude/analytics-browser | 최신 SDK, Tree-shaking 지원, TypeScript 타입 내장 | vi.mock으로 쉽게 mocking |
| 익명 사용자 ID | 자체 UUID / Amplitude device ID | Amplitude device ID | SDK가 자동 관리, identity stitching 기본 지원 | 별도 테스트 불필요 |
| 환경 게이팅 | 조건부 import / No-op Provider | No-op Provider | 코드 경로 단일화, 테스트 용이 | NoopProvider로 dev 환경 테스트 |
| 이벤트 발화 위치 | 컴포넌트 직접 / 커스텀 훅 | 커스텀 훅 (useAnalytics 등) | 관심사 분리, 재사용성, 테스트 격리 | renderHook으로 훅 단독 테스트 |
| GA4 기존 코드 | 유지 / Adapter로 래핑 | Adapter로 래핑 | 기존 `setupGoogleAnalytics`와 `router.subscribe` 로직을 GA4Provider로 이관 | 일관된 테스트 방식 |
| 체류 시간 | 자체 구현 / SDK 기본 | SDK 기본 (Amplitude 세션 관리) | FR-002 요구사항 + Amplitude 자동 세션 트래킹 활용 | 별도 테스트 불필요 |
| memberId 저장 | sessionStorage / localStorage | localStorage | FR-004: 재방문 시에도 동일 user ID로 추적 필요 | vi.stubGlobal로 테스트 |

## Amplitude 무료 플랜 상세 분석

### 무료 Starter 플랜으로 충분한 이유

1. **50,000 MTU**: 토론 타이머 서비스의 현재 사용자 규모를 고려하면 충분
2. **Identity Stitching**: 비회원(device ID) → 회원(user ID) 자동 병합 — 무료 지원
3. **커스텀 이벤트**: 15종 이벤트 모두 무료 플랜에서 트래킹 가능
4. **사용자 속성**: `user_type`, `language` 등 무제한 설정 가능
5. **퍼널 분석**: 기본 퍼널 차트 무료 사용 가능
6. **세션 추적**: 자동 세션 관리 무료 (라우트별 체류 시간은 `page_leave` 이벤트로 자체 측정)
7. **데이터 보존**: 무료 플랜 기본 보존 기간 제공

### 유료 플랜이 필요한 경우 (현재 해당 없음)

- MTU가 50,000을 초과하는 경우 → Plus 플랜 ($49/월, 300K MTU)
- 고급 행동 코호트, 예측 분석이 필요한 경우
- 커스텀 대시보드/리포트가 필요한 경우 (현재는 기본 대시보드 사용)

## TDD Implementation Order

Red-Green-Refactor 사이클에 따른 구현 순서:

### Phase 1: 타입 정의 (테스트 불필요 — 컴파일 타임 검증)

1. `src/util/analytics/types.ts` — 이벤트 타입, Provider/Manager 인터페이스
2. `src/util/analytics/constants.ts` — 이벤트 이름 상수

### Phase 2: AnalyticsManager (순수 로직)

```
RED:   analyticsManager.test.ts — 8개 테스트 (팬아웃, 에러 격리, 빈 provider)
GREEN: analyticsManager.ts — 최소 구현
REFACTOR: 불필요한 중복 제거
```

### Phase 3: Providers (SDK 래핑)

```
RED:   amplitudeProvider.test.ts — 6개 테스트 (init, track, identify, reset)
GREEN: amplitudeProvider.ts — Amplitude SDK 래핑
RED:   ga4Provider.test.ts — 2개 테스트 (pageview, event)
GREEN: ga4Provider.ts — ReactGA 래핑
```

### Phase 4: NoopProvider + 환경 게이팅

```
RED:   analyticsManager.test.ts — 2개 추가 테스트 (환경 게이팅)
GREEN: noopProvider.ts + init 로직에 환경 분기 추가
```

TODO: 환경 게이팅 테스트는 계획에 포함되어 있으나 현재 `analyticsManager.test.ts`에 반영되지 않았다.

### Phase 5: 초기화 + 라우터 통합

```
RED:   usePageTracking.test.ts — 5개 테스트 (마운트 page_view, 경로 변경 page_view, 경로 변경 page_leave, 언마운트 page_leave, duration_ms 정확성)
GREEN: usePageTracking.ts — 라우터 구독 + page_view/page_leave 발화 + 진입 시각 기록으로 라우트별 체류 시간 측정
```
- `main.tsx` 수정: `setupAnalytics()` 호출
- `TODO`: 현재 `usePageTracking()` 통합 지점은 `routes.tsx`가 아니라 `src/routes/LanguageWrapper.tsx`이다
- `TODO`: 계획된 `usePageTracking` 테스트 케이스 중 경로 변경/pagehide/flush 검증은 아직 미완료 상태다

### Phase 6: useAnalytics 훅

```
RED:   useAnalytics.test.ts — 4개 테스트 (trackEvent, trackPageView, identifyUser, resetUser)
GREEN: useAnalytics.ts — Manager 래핑 훅
```

### Phase 7: Identity 관리 + 로그인 출처 추적

- `src/util/accessToken.ts` 수정: `setMemberId()`, `getMemberId()`, `removeMemberId()` 추가
- `src/util/analytics/loginTrigger.ts` 신규: `setLoginTrigger(trigger, options?)`, `consumeLoginTrigger()`, `clearLoginTrigger()`, `hasLoginTrigger()` — `sessionStorage`에 로그인 출처 메타데이터(`trigger_page`, `trigger_context`) 저장/복원/제거. 기본적으로 기존 trigger가 있으면 덮어쓰지 않아 `protected_route` 등 원래 컨텍스트 보존 (`{ force: true }` 옵션으로 강제 설정 가능)
- `src/hooks/mutations/usePostUser.ts` 수정: 로그인 성공 시 `setMemberId()` + `identifyUser()` 호출
- `src/page/OAuthPage/OAuth.tsx` 수정: 로그인 완료 후 `getLoginTrigger()`로 출처를 복원하여 `login_completed` 이벤트 발화, 이후 `clearLoginTrigger()` 호출
- 각 로그인 진입점 수정: OAuth 리다이렉트 전 `setLoginTrigger({ trigger_page, trigger_context })` 호출
  - `useLandingPageHandlers.ts` — `'landing_header'`, `'landing_table_section'` (기존 trigger 없을 때만)
  - `LoginAndStoreModal.tsx` — `'timer_modal'` (기존 trigger 없을 때만)
  - `ProtectedRoute.tsx` — `'protected_route'` (리다이렉트 전 최초 설정, 이후 로그인 버튼에서 보존됨)
  - `TODO`: `TableSharingPage` (공유 저장 시) — `'share_save'` (현재 아키텍처상 해당 OAuth 진입점 미구현)
- `src/hooks/mutations/useLogout.ts` 수정: 로그아웃 시 `removeMemberId()` + `resetUser()` 호출
- `src/apis/axiosInstance.ts` 수정: 리프레시 토큰 실패로 accessToken 제거 시 `removeMemberId()` + `analytics.reset()` 함께 호출 (인증 해제 시 memberId 잔존 방지)
- `src/main.tsx` 수정: 앱 시작 시 `accessToken`과 `memberId`가 **모두 존재할 때만** `setUserId()` 호출. accessToken 없이 memberId만 있으면 memberId를 제거하여 비회원으로 처리

### Phase 8: 토론 추적 훅

```
RED:   useDebateTracking.test.ts — 4개 테스트 (시작, 완료, 이탈, visibility)
GREEN: useDebateTracking.ts — 타이머 페이지 전용 추적 훅
```

### Phase 9: 페이지별 이벤트 통합

각 페이지 컴포넌트/훅에 `useAnalytics().trackEvent()` 호출 추가:
1. LandingPage — `login_started`, `template_selected`
2. TableOverviewPage — `table_shared`
3. TableSharingPage — `share_link_entered`
4. TimerPage — `timer_started`, `template_used` (템플릿 기반 토론 시작 시), useDebateTracking 통합
5. DebateEndPage — `feedback_timer_started`, `poll_created` (투표 생성 mutation 성공 시)
TODO: `debate_completed`는 현재 `DebateEndPage`가 아니라 `TimerPage`의 종료 액션에서 발화한다
6. VoteParticipationPage — `poll_voted`
7. DebateVoteResultPage — `poll_result_viewed`

### Phase 10: 환경 변수 + 최종 통합

- `.env.production`에 `VITE_AMPLITUDE_API_KEY` 추가
- `setupGoogleAnalytics.tsx` 제거 (GA4Provider로 이관됨)
- 기존 `router.subscribe` GA4 호출 제거
- 빌드 및 번들 크기 확인

TODO: 감사 기준 현재 FR-016 게이팅은 env 판독 기반이 아니라 하드코딩 상태로 남아 있어 문서상 기대와 불일치한다.

## Complexity Tracking

> 복잡성 위반 없음. 모든 Constitution Gate 통과.
