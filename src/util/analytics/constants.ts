import type { AnalyticsEventName } from './types';

/** 문자열 오타 없이 이벤트 이름을 재사용하기 위한 애널리틱스 이벤트 상수 맵이다. */
export const ANALYTICS_EVENTS: Record<AnalyticsEventName, AnalyticsEventName> =
  {
    page_view: 'page_view',
    page_leave: 'page_leave',
    login_started: 'login_started',
    login_completed: 'login_completed',
    table_shared: 'table_shared',
    share_link_entered: 'share_link_entered',
    timer_started: 'timer_started',
    debate_completed: 'debate_completed',
    debate_abandoned: 'debate_abandoned',
    template_selected: 'template_selected',
    template_used: 'template_used',
    poll_created: 'poll_created',
    poll_voted: 'poll_voted',
    poll_result_viewed: 'poll_result_viewed',
    feedback_timer_started: 'feedback_timer_started',
  } as const;
