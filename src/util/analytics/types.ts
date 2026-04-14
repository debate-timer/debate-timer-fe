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

/** 페이지 이탈 이벤트 속성 */
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
  table_id: number | 'guest';
}

/** 공유 링크 유입 이벤트 속성 */
export interface ShareLinkEnteredProperties {
  referrer: string;
}

/** 타이머 시작 이벤트 속성 */
export interface TimerStartedProperties {
  table_id: number | 'guest';
  total_rounds: number;
}

/** 토론 완료 이벤트 속성 */
export interface DebateCompletedProperties {
  table_id: number | 'guest';
  total_rounds: number;
}

/** 토론 이탈 이벤트 속성 */
export interface DebateAbandonedProperties {
  table_id: number | 'guest';
  current_round: number;
  total_rounds: number;
  abandon_type: 'navigation' | 'unload' | 'visibility';
}

/** 템플릿 선택 이벤트 속성 */
export interface TemplateSelectedProperties {
  organization_name: string;
  template_name: string;
  template_label: string; // "{organization_name} - {template_name}" 조합값
}

/** 템플릿 사용 이벤트 속성 */
export interface TemplateUsedProperties extends TemplateSelectedProperties {
  table_id: number | 'guest';
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

/** 사용자 속성 */
export interface AnalyticsUserProperties {
  user_type: 'member' | 'guest';
  language: string;
}

/** 글로벌 필드가 합성된 최종 페이로드 */
export type EnrichedEventProperties<T> = T & GlobalEventProperties;

/** 각 분석 도구가 구현해야 하는 인터페이스 */
export interface AnalyticsProvider {
  readonly name: string;
  init(): void;
  trackPageView(properties: EnrichedEventProperties<PageViewProperties>): void;
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: EnrichedEventProperties<AnalyticsEventMap[T]>,
  ): void;
  setUserId(userId: string): void;
  setUserProperties(properties: AnalyticsUserProperties): void;
  reset(): void;
  flush(): void;
}

/** 여러 Provider에 이벤트를 팬아웃하는 매니저 인터페이스 */
export interface AnalyticsManagerInterface {
  addProvider(provider: AnalyticsProvider): void;
  init(): void;
  trackPageView(properties: PageViewProperties): void;
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: AnalyticsEventMap[T],
  ): void;
  setUserId(userId: string): void;
  setUserProperties(properties: AnalyticsUserProperties): void;
  reset(): void;
  flush(): void;
}
