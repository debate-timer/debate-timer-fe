# Test Contracts: 사용자 지표 수집 시스템

## 테스트 우선순위 및 구현 순서

```
1. util/analytics/ (순수 함수, AnalyticsManager) → 의존성 없음
2. util/analytics/providers/ (AmplitudeProvider, GA4Provider) → SDK mock
3. hooks/ (useAnalytics, usePageTracking, useDebateTracking) → Provider mock
4. 페이지 통합 (이벤트 발화 확인) → hook mock
```

---

## 1. AnalyticsManager (`src/util/analytics/analyticsManager.test.ts`)

### describe: 'AnalyticsManager'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'provider를 등록할 수 있다' | `addProvider(mockProvider)` | `init()` 호출 시 mockProvider.init() 호출됨 | - |
| '여러 provider에 이벤트를 팬아웃한다' | 2개 provider 등록 + `trackEvent('template_selected', { organization_name: 'org', template_name: 'tmpl', template_label: 'org - tmpl' })` | 두 provider 모두 `trackEvent` 호출됨 | - |
| 'trackPageView를 모든 provider에 전달한다' | `trackPageView({ page_title: 'Home', previous_page_path: '', referrer: '' })` | 모든 provider의 `trackPageView` 호출됨 | - |
| 'setUserId를 모든 provider에 전파한다' | `setUserId('123')` | 모든 provider의 `setUserId('123')` 호출됨 | - |
| 'setUserProperties를 모든 provider에 전파한다' | `setUserProperties({...})` | 모든 provider의 `setUserProperties` 호출됨 | - |
| 'reset을 모든 provider에 전파한다' | `reset()` | 모든 provider의 `reset()` 호출됨 | - |
| 'flush를 모든 provider에 전파한다' | `flush()` | 모든 provider의 `flush()` 호출됨 | - |
| 'provider가 없어도 에러 없이 동작한다' | provider 없이 `trackEvent(...)` | 에러 없이 정상 반환 | 빈 provider 목록 |
| 'provider에서 에러 발생 시 다른 provider에 영향 없다' | provider1 에러, provider2 정상 | provider2는 정상 호출됨 | provider 에러 격리 |
| 'trackEvent 시 글로벌 필드(user_type, language, page_path)가 자동 합성된다' | `trackEvent('template_selected', { organization_name: 'org', template_name: 'tmpl', template_label: 'org - tmpl' })` | provider가 받는 properties에 `user_type`, `language`, `page_path` 포함 | 호출자가 글로벌 필드를 전달하지 않아도 합성됨 |
| 'trackPageView 시 글로벌 필드가 자동 합성된다' | `trackPageView({ page_title: 'Home', previous_page_path: '', referrer: '' })` | provider가 받는 properties에 글로벌 필드 포함 | - |

---

## 2. AmplitudeProvider (`src/util/analytics/providers/amplitudeProvider.test.ts`)

### describe: 'AmplitudeProvider'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'init 호출 시 amplitude.init이 API 키로 호출된다' | `init()` | `amplitude.init(API_KEY)` 호출됨 | - |
| 'trackEvent 호출 시 amplitude.track이 호출된다' | `trackEvent('template_selected', { organization_name: 'org', template_name: 'tmpl', template_label: 'org - tmpl', user_type: 'guest', language: 'ko', page_path: '/home' })` | `amplitude.track('template_selected', {...})` 호출됨 | - |
| 'trackPageView 호출 시 amplitude.track이 page_view로 호출된다' | `trackPageView({ page_title: 'Home', previous_page_path: '', referrer: '', user_type: 'guest', language: 'ko', page_path: '/home' })` | `amplitude.track('page_view', {...})` 호출됨 | - |
| 'setUserId 호출 시 amplitude.setUserId가 호출된다' | `setUserId('42')` | `amplitude.setUserId('user_42')` 호출됨 | user ID에 `user_` prefix 추가 |
| 'setUserProperties 호출 시 amplitude.identify가 호출된다' | `setUserProperties({user_type: 'member', language: 'ko'})` | `amplitude.identify(...)` 호출됨 | - |
| 'reset 호출 시 amplitude.reset이 호출된다' | `reset()` | `amplitude.reset()` 호출됨 | - |
| 'flush 호출 시 amplitude.flush이 호출된다' | `flush()` | `amplitude.flush()` 호출됨 | - |

---

## 3. GA4Provider (`src/util/analytics/providers/ga4Provider.test.ts`)

### describe: 'GA4Provider'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'trackPageView 호출 시 ReactGA.send가 호출된다' | `trackPageView({ page_title: 'Home', previous_page_path: '', referrer: '', user_type: 'guest', language: 'ko', page_path: '/home' })` | `ReactGA.send({hitType: 'pageview', ...})` 호출됨 | - |
| 'trackEvent 호출 시 ReactGA.event가 호출된다' | `trackEvent('timer_started', { table_id: 'guest', total_rounds: 5, user_type: 'guest', language: 'ko', page_path: '/table/customize/guest/timer' })` | `ReactGA.event(...)` 호출됨 | `table_id`는 문자열 fallback 허용 |

---

## 4. useAnalytics 훅 (`src/hooks/useAnalytics.test.ts`)

### describe: 'useAnalytics'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'trackEvent를 호출할 수 있다' | `trackEvent('template_selected', { organization_name: 'org', template_name: 'tmpl', template_label: 'org - tmpl' })` | AnalyticsManager.trackEvent 호출됨 | - |
| 'trackPageView를 호출할 수 있다' | `trackPageView({ page_title: 'Home', previous_page_path: '', referrer: '' })` | AnalyticsManager.trackPageView 호출됨 | - |
| 'identifyUser를 호출하면 setUserId와 setUserProperties가 호출된다' | `identifyUser(42)` | `setUserId('42')` + `setUserProperties({ user_type: 'member', language: currentLang })` 호출됨 | - |
| 'resetUser를 호출하면 reset이 호출된다' | `resetUser()` | AnalyticsManager.reset 호출됨 | - |

---

## 5. usePageTracking 훅 (`src/hooks/usePageTracking.test.tsx`)

### describe: 'usePageTracking'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| '마운트 시 page_view 이벤트가 발생한다' | 훅 마운트 | `trackPageView` 호출됨 | - |
| 'TODO: 경로 변경 시 page_view 이벤트가 발생한다' | location 변경 | `trackPageView({ page_title, previous_page_path, referrer })` 재호출됨 (새 경로) | 현재 테스트 미구현 |
| 'TODO: 경로 변경 시 이전 페이지의 page_leave 이벤트가 발생한다' | location 변경 | `trackEvent('page_leave', { page_title, page_path, duration_ms })` 호출됨 | 현재 테스트 미구현 |
| '언마운트 시 page_leave 이벤트가 발생한다' | 훅 언마운트 | `trackEvent('page_leave', { page_title, page_path, duration_ms })` 호출됨 | - |
| 'duration_ms가 진입 시각부터 이탈 시각까지의 차이이다' | 100ms 후 언마운트 | `duration_ms >= 100` | 음수 불가 |
| 'TODO: pagehide 시 마지막 페이지 page_leave 이벤트가 발생한다' | `pagehide` dispatch | `trackEvent('page_leave', { page_path, duration_ms })` 호출됨 | 현재 테스트 미구현 |
| 'TODO: 언로드 시 flush가 호출된다' | `beforeunload` dispatch | `analyticsManager.flush()` 호출됨 | 현재 테스트 미구현 |

---

## 6. useDebateTracking 훅 (`src/page/TimerPage/hooks/useDebateTracking.test.ts`)

### describe: 'useDebateTracking'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'trackTimerStarted 호출 시 timer_started 이벤트가 발생한다' | `trackTimerStarted({ table_id: 'guest', total_rounds: 5 })` | `trackEvent('timer_started', { table_id: 'guest', total_rounds: 5 })` 호출됨 | 문자열 fallback 허용 |
| 'trackDebateCompleted 호출 시 debate_completed 이벤트가 발생한다' | `trackDebateCompleted({ table_id: 'guest', total_rounds: 5 })` | `trackEvent('debate_completed', { table_id: 'guest', total_rounds: 5 })` 호출됨 | 문자열 fallback 허용 |
| '언마운트 시 debate_abandoned 이벤트가 발생한다 (토론 미완료 시)' | 토론 중 언마운트 | trackEvent('debate_abandoned', ...) 호출됨 | 토론 완료 상태면 미발화 |
| 'visibilitychange 이벤트 시 이탈 이벤트가 발생한다' | `document.visibilityState = 'hidden'` | trackEvent('debate_abandoned', {abandon_type: 'visibility'}) | 토론 중일 때만 |

---

## 7. 이벤트 타입 안전성 (`src/util/analytics/types.test.ts`)

### describe: '이벤트 타입 안전성'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'TODO: 정의되지 않은 이벤트명은 타입 에러를 발생시킨다' | 컴파일 타임 검증 | TypeScript 타입 체크로 검증 | 현재 테스트 파일 미구현 |
| 'TODO: 이벤트 속성이 누락되면 타입 에러를 발생시킨다' | 컴파일 타임 검증 | TypeScript 타입 체크로 검증 | 현재 테스트 파일 미구현 |

---

## 8. 프로덕션 환경 게이팅 (`src/util/analytics/analyticsManager.test.ts`)

### describe: '환경 게이팅'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'TODO: 프로덕션 환경에서만 provider가 초기화된다' | `MODE = 'production'` | provider.init() 호출됨 | 현재 테스트 미구현 |
| 'TODO: 개발 환경에서는 provider가 초기화되지 않는다' | `MODE = 'development'` | provider.init() 호출되지 않음 | 현재 테스트 미구현 |

---

## 9. loginTrigger 유틸 (`src/util/analytics/loginTrigger.test.ts`)

### describe: 'loginTrigger'

| test | 입력 | 예상 출력 | 경계 조건 |
|------|------|-----------|-----------|
| 'TODO: setLoginTrigger로 저장한 값을 consumeLoginTrigger로 복원 및 삭제할 수 있다' | `setLoginTrigger({ trigger_page: '/home', trigger_context: 'landing_header' })` | `consumeLoginTrigger()` → 동일 객체, 이후 `consumeLoginTrigger()` → `null` | 현재 테스트 파일 미구현 |
| 'TODO: clearLoginTrigger 호출 후 consumeLoginTrigger는 null을 반환한다' | `clearLoginTrigger()` | `consumeLoginTrigger()` → `null` | 현재 테스트 파일 미구현 |
| 'TODO: sessionStorage에 값이 없으면 null을 반환한다' | 저장 없이 `consumeLoginTrigger()` | `null` | 현재 테스트 파일 미구현 |
| 'TODO: OAuth 리다이렉트 시뮬레이션: 저장 → 페이지 리로드 → 복원 가능' | `setLoginTrigger(...)` → sessionStorage 유지 | `consumeLoginTrigger()` 정상 복원 | 현재 테스트 파일 미구현 |
| 'TODO: 기존 trigger가 있으면 setLoginTrigger는 덮어쓰지 않는다' | `setLoginTrigger({ trigger_context: 'protected_route' })` → `setLoginTrigger({ trigger_context: 'landing_header' })` | `consumeLoginTrigger()` → `trigger_context: 'protected_route'` | 현재 테스트 파일 미구현 |
| 'TODO: force 옵션으로 기존 trigger를 강제 덮어쓸 수 있다' | `setLoginTrigger({ trigger_context: 'protected_route' })` → `setLoginTrigger({ trigger_context: 'landing_header' }, { force: true })` | `consumeLoginTrigger()` → `trigger_context: 'landing_header'` | 현재 테스트 파일 미구현 |
| 'TODO: hasLoginTrigger는 trigger 존재 여부를 반환한다' | `setLoginTrigger(...)` | `hasLoginTrigger()` → `true` | 현재 테스트 파일 미구현 |
| 'TODO: 5분 초과된 trigger는 만료 처리된다' | 5분 이전에 `setLoginTrigger(...)` | `consumeLoginTrigger()` → `null` | 현재 테스트 파일 미구현 |

---

## 테스트 설정 참고사항

- **Vitest globals**: `describe`, `test`, `expect` import 없이 사용
- **테스트 설명**: 한국어로 작성
- **Amplitude SDK mock**: `vi.mock('@amplitude/analytics-browser')`
- **ReactGA mock**: `vi.mock('react-ga4')`
- **Router mock**: `vi.mock('react-router-dom', ...)` 또는 `MemoryRouter` 사용
- **MSW 불필요**: 이 기능은 외부 API 호출이 아닌 SDK 호출이므로 MSW 대신 `vi.mock` 사용
