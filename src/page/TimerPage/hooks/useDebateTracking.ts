import { useCallback, useEffect, useRef } from 'react';
import { analyticsManager } from '../../../util/analytics';
import type {
  DebateAbandonedProperties,
  DebateCompletedProperties,
  TimerStartedProperties,
} from '../../../util/analytics/types';

// 토론 시작, 완료, 이탈 이벤트를 일관되게 기록하기 위한 추적 훅이다.
export default function useDebateTracking() {
  const isDebateActiveRef = useRef(false);
  const isCompletedRef = useRef(false);
  const debateInfoRef = useRef<{
    table_id: number | 'guest';
    current_round: number;
    total_rounds: number;
  } | null>(null);

  // 타이머 시작 시 timer_started 이벤트와 현재 토론 메타데이터를 기록한다.
  const trackTimerStarted = useCallback(
    (properties: TimerStartedProperties) => {
      analyticsManager.trackEvent('timer_started', properties);
      isDebateActiveRef.current = true;
      isCompletedRef.current = false;
      debateInfoRef.current = {
        table_id: properties.table_id,
        current_round: 1,
        total_rounds: properties.total_rounds,
      };
    },
    [],
  );

  // 토론 종료 시 debate_completed 이벤트를 기록하고 활성 상태를 정리한다.
  const trackDebateCompleted = useCallback(
    (properties: DebateCompletedProperties) => {
      analyticsManager.trackEvent('debate_completed', properties);
      isDebateActiveRef.current = false;
      isCompletedRef.current = true;
    },
    [],
  );

  // 현재 라운드와 전체 라운드 수를 최신 상태로 유지한다.
  const updateProgress = useCallback(
    (currentRound: number, totalRounds: number) => {
      if (debateInfoRef.current) {
        debateInfoRef.current.current_round = currentRound;
        debateInfoRef.current.total_rounds = totalRounds;
      }
    },
    [],
  );

  // 비정상 이탈이 감지되면 debate_abandoned 이벤트를 한 번만 기록한다.
  const sendAbandonEvent = useCallback(
    (abandonType: DebateAbandonedProperties['abandon_type']) => {
      if (
        isDebateActiveRef.current &&
        !isCompletedRef.current &&
        debateInfoRef.current
      ) {
        analyticsManager.trackEvent('debate_abandoned', {
          table_id: debateInfoRef.current.table_id,
          current_round: debateInfoRef.current.current_round,
          total_rounds: debateInfoRef.current.total_rounds,
          abandon_type: abandonType,
        });
        analyticsManager.flush();
        isDebateActiveRef.current = false;
      }
    },
    [],
  );

  // 새로고침, 탭 비가시화, SPA 이탈 시 abandon 이벤트를 보낼 리스너를 등록한다.
  useEffect(() => {
    function handleBeforeUnload() {
      sendAbandonEvent('unload');
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sendAbandonEvent('visibility');
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // SPA navigation 이탈
      sendAbandonEvent('navigation');
    };
  }, [sendAbandonEvent]);

  return {
    trackTimerStarted,
    trackDebateCompleted,
    updateProgress,
  };
}
