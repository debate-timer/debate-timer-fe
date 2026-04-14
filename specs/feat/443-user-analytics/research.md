# Research: 사용자 지표 수집 시스템

## R-001: Amplitude 무료 플랜 적합성

**Decision**: Amplitude Starter (무료) 플랜 사용

**Rationale**:
- Starter 플랜: 50,000 MTU (Monthly Tracked Users), 무제한 이벤트, 기본 퍼널 분석
- 토론 타이머 서비스의 예상 사용자 규모는 50K MTU 이하로 충분
- Identity stitching (비회원→회원 연결): 무료 플랜에서 기본 지원
  - Amplitude는 device ID로 익명 사용자를 추적하고, `setUserId()` 호출 시 자동으로 이전 이벤트를 병합
- 커스텀 이벤트, 사용자 속성, 세션 추적: 모두 무료 플랜에서 지원
- 기본 대시보드, 차트, 코호트 분석: 무료 플랜에서 사용 가능

**무료 플랜 제한 사항 (현재 요구사항에 영향 없음)**:
- 고급 행동 코호트 제한 (Plus 플랜부터)
- 데이터 보존 기간 제한 가능
- 고급 세그멘테이션 일부 제한
- MTU 기반 과금이므로 50K 초과 시 Plus 플랜 ($49/월) 필요

**Alternatives Considered**:
- Mixpanel Free: 20M 이벤트/월, 하지만 identity merge 설정이 더 복잡
- PostHog: 오픈소스, 셀프호스팅 필요한 경우 비용 증가
- GA4 단독: 이미 사용 중이지만 커스텀 이벤트와 퍼널 분석에 한계

## R-002: Amplitude SDK 선택

**Decision**: `@amplitude/analytics-browser` (Browser SDK 2) 사용

**Rationale**:
- 최신 Browser SDK 2는 Tree-shaking 지원, 번들 크기 최적화
- `npm install @amplitude/analytics-browser`로 설치
- TypeScript 타입 지원 내장
- 자동 세션 관리, 페이지 방문 추적 플러그인 제공
- `init()` → `track()` → `setUserId()` → `reset()` 간단한 API

**Alternatives Considered**:
- `@amplitude/unified` (Unified SDK): Analytics + Experiment + Session Replay 통합이지만 현재 Experiment/Session Replay 불필요하므로 오버스펙
- `amplitude-js` (Legacy SDK): 더 이상 권장하지 않음 (deprecated)

## R-003: Analytics Adapter 패턴 설계

**Decision**: Provider/Adapter 패턴으로 분석 도구 추상화

**Rationale**:
- FR-014 요구사항: "분석 도구에 독립적인 추상화 계층"
- GA4와 Amplitude에 동시 전송, 추후 GA4 제거 시 설정 변경만으로 이관
- 각 분석 도구를 `AnalyticsProvider` 인터페이스로 추상화
- `AnalyticsManager`가 등록된 provider들에 이벤트를 팬아웃(fan-out)

**구현 전략**:
```
AnalyticsProvider (interface)
├── AmplitudeProvider (implements)
└── GA4Provider (implements)

AnalyticsManager
├── providers: AnalyticsProvider[]
├── init()
├── trackPageView(page, properties)
├── trackEvent(name, properties)
├── setUserId(id)
├── setUserProperties(props)
└── reset()
```

**Alternatives Considered**:
- 각 페이지에서 직접 SDK 호출: 도구 교체 시 전체 코드 수정 필요 → 거부
- Segment 같은 CDP 활용: 추가 비용 발생, 현재 규모에서 불필요

## R-004: Identity Stitching 구현 방식

**Decision**: Amplitude 기본 device ID + `setUserId()` 활용

**Rationale**:
- Amplitude Browser SDK 2는 자동으로 device ID를 생성/관리
- 비회원 사용자: device ID로 추적 (SDK 기본 동작)
- 회원 로그인 시: `amplitude.setUserId(memberId)` 호출
  - Amplitude가 자동으로 이전 anonymous 이벤트를 해당 user ID로 병합
- 회원 ID 영속 저장: `localStorage`에 memberId 저장 (FR-004 요구사항)
  - 기존 `postUser` 응답의 `id` 필드 활용
  - 재방문 시 localStorage에서 memberId 읽어 `setUserId()` 호출
- 로그아웃 시: `amplitude.reset()` 호출하여 user ID 해제

**Alternatives Considered**:
- 자체 UUID 생성 + 쿠키 저장: Amplitude 기본 device ID가 이미 이 역할 수행 → 불필요

## R-005: 토론 중도 이탈 감지 방식

**Decision**: 다중 이벤트 리스너 조합 (beforeunload + visibilitychange + router)

**Rationale** (FR-008):
- SPA 환경에서 단일 이벤트로는 모든 이탈 시나리오를 커버할 수 없음
- `beforeunload`: 탭 닫기, 브라우저 닫기, 외부 URL 이동
- `visibilitychange` / `pagehide`: 모바일 환경 백그라운드 전환
- React Router `beforeunload` blocker 또는 `useEffect` cleanup: SPA 내부 네비게이션
- Amplitude `sendBeacon` transport: 페이지 언로드 시에도 이벤트 전송 보장

## R-006: 성능 영향 최소화

**Decision**: Amplitude SDK 비동기 로드 + 프로덕션 환경 전용 초기화

**Rationale** (FR-012, FR-016, SC-007):
- Amplitude Browser SDK 2: ~36KB gzipped, Tree-shaking으로 사용하지 않는 모듈 제거
- 프로덕션 환경에서만 초기화 (FR-016): dev에서는 no-op adapter 사용
- SDK 내장 배치 전송: 이벤트를 즉시 전송하지 않고 배치로 묶어 전송
- SDK 장애 시 내장 큐잉/재시도에 위임 (FR-012)
