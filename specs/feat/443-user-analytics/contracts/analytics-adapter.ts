/**
 * Analytics Adapter 계약 (Contract)
 *
 * 분석 도구에 독립적인 추상화 계층 (FR-014)
 * GA4와 Amplitude에 동시 전송하며, 추후 GA4 제거 시 설정 변경만으로 이관
 */

// ─── 이벤트 타입 정의 ───

/** 모든 이벤트에 포함되는 공통 속성 */
export interface GlobalEventProperties {
  user_type: 'member' | 'guest';
  language: string;
  page_path: string;
}

/** 페이지뷰 이벤트 속성 */
export interface PageViewProperties {
  page_title: string;
  previous_page_path: string;
  referrer: string;
}

/** 페이지 이탈 이벤트 속성 (라우트별 체류 시간 측정) */
export interface PageLeaveProperties {
  page_title: string;
  page_path: string;
  duration_ms: number;
}

/** 로그인 시작 이벤트 속성 */
export interface LoginStartedProperties {
  trigger_page: string;
  trigger_context:
    | 'landing_header'
    | 'landing_table_section'
    | 'share_save'
    | 'timer_modal'
    | 'protected_route'
    | 'unknown';
}

/** 로그인 완료 이벤트 속성 */
export interface LoginCompletedProperties extends LoginStartedProperties {
  member_id: number;
}

/** 시간표 공유 이벤트 속성 */
export interface TableSharedProperties {
  table_id: number | string;
}

/** 공유 링크 유입 이벤트 속성 */
export interface ShareLinkEnteredProperties {
  referrer: string;
}

/** 타이머 시작 이벤트 속성 */
export interface TimerStartedProperties {
  table_id: number | string;
  total_rounds: number;
}

/** 토론 완료 이벤트 속성 */
export interface DebateCompletedProperties {
  table_id: number | string;
  total_rounds: number;
}

/** 토론 이탈 이벤트 속성 */
export interface DebateAbandonedProperties {
  table_id: number | string;
  current_round: number;
  total_rounds: number;
  abandon_type: 'navigation' | 'unload' | 'visibility';
}

/** 템플릿 선택 이벤트 속성 */
export interface TemplateSelectedProperties {
  organization_name: string;
  template_name: string;
  template_label: string;
}

/** 템플릿 사용 이벤트 속성 */
export interface TemplateUsedProperties extends TemplateSelectedProperties {
  table_id: number | string;
}

/** 투표 생성 이벤트 속성 */
export interface PollCreatedProperties {
  table_id: number;
  poll_id: number;
}

/** 투표 참여 이벤트 속성 */
export interface PollVotedProperties {
  poll_id: number;
  team: string;
}

/** 투표 결과 조회 이벤트 속성 */
export interface PollResultViewedProperties {
  poll_id: number;
}

/** 피드백 타이머 시작 이벤트 속성 */
export interface FeedbackTimerStartedProperties {
  table_id: number;
}

/** 이벤트 이름 → 속성 타입 매핑 */
export interface AnalyticsEventMap {
  page_view: PageViewProperties;
  page_leave: PageLeaveProperties;
  login_started: LoginStartedProperties;
  login_completed: LoginCompletedProperties;
  table_shared: TableSharedProperties;
  share_link_entered: ShareLinkEnteredProperties;
  timer_started: TimerStartedProperties;
  debate_completed: DebateCompletedProperties;
  debate_abandoned: DebateAbandonedProperties;
  template_selected: TemplateSelectedProperties;
  template_used: TemplateUsedProperties;
  poll_created: PollCreatedProperties;
  poll_voted: PollVotedProperties;
  poll_result_viewed: PollResultViewedProperties;
  feedback_timer_started: FeedbackTimerStartedProperties;
}

/** 이벤트 이름 유니온 타입 */
export type AnalyticsEventName = keyof AnalyticsEventMap;

// ─── 사용자 속성 ───

export interface AnalyticsUserProperties {
  user_type: 'member' | 'guest';
  language: string;
}

// ─── Provider 인터페이스 ───

/** 글로벌 필드가 합성된 최종 페이로드 */
export type EnrichedEventProperties<T> = T & GlobalEventProperties;

/**
 * 각 분석 도구가 구현해야 하는 인터페이스
 *
 * Provider는 이미 enrichment된 페이로드를 받는다.
 * 글로벌 필드 합성은 Manager가 담당한다.
 */
export interface AnalyticsProvider {
  /** Provider 이름 (디버그용) */
  readonly name: string;

  /** SDK 초기화 */
  init(): void;

  /** 페이지뷰 트래킹 (글로벌 필드 포함) */
  trackPageView(properties: EnrichedEventProperties<PageViewProperties>): void;

  /** 커스텀 이벤트 트래킹 (글로벌 필드 포함) */
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: EnrichedEventProperties<AnalyticsEventMap[T]>,
  ): void;

  /** 사용자 ID 설정 (로그인 시) */
  setUserId(userId: string): void;

  /** 사용자 속성 설정 */
  setUserProperties(properties: AnalyticsUserProperties): void;

  /** 사용자 ID 초기화 (로그아웃 시) */
  reset(): void;

  /** 언로드 시 대기 중인 이벤트 즉시 전송 (sendBeacon transport 사용) */
  flush(): void;
}

// ─── Manager 인터페이스 ───

/**
 * 여러 Provider에 이벤트를 팬아웃하는 매니저
 *
 * Manager는 호출자로부터 이벤트별 속성만 받고,
 * 내부에서 GlobalEventProperties(user_type, language, page_path)를
 * 자동 합성(enrich)하여 Provider에 전달한다.
 * → 호출자가 글로벌 필드를 빠뜨릴 수 없는 구조.
 */
export interface AnalyticsManager {
  /** Provider 등록 */
  addProvider(provider: AnalyticsProvider): void;

  /** 모든 Provider 초기화 */
  init(): void;

  /** 페이지뷰 트래킹 — 글로벌 필드는 Manager가 자동 합성 */
  trackPageView(properties: PageViewProperties): void;

  /** 커스텀 이벤트 트래킹 (모든 Provider에 전송) */
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: AnalyticsEventMap[T],
  ): void;

  /** 사용자 ID 설정 (모든 Provider에 전파) */
  setUserId(userId: string): void;

  /** 사용자 속성 설정 (모든 Provider에 전파) */
  setUserProperties(properties: AnalyticsUserProperties): void;

  /** 사용자 ID 초기화 (모든 Provider에 전파) */
  reset(): void;

  /** 언로드 시 모든 Provider의 대기 이벤트 즉시 전송 */
  flush(): void;
}
