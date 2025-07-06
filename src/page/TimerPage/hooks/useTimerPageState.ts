import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetDebateTableData } from '../../../hooks/query/useGetDebateTableData';
import { useCustomTimer } from './useCustomTimer';
import { useNormalTimer } from './useNormalTimer';
import { isGuestFlow } from '../../../util/sessionStorage';
import { useBellSound } from './useBellSound';

// ===== 배경 색상 상태 타입 및 컬러 맵 정의 =====
export type TimerState = 'default' | 'warning' | 'danger' | 'expired';
export const bgColorMap: Record<TimerState, string> = {
  default: '',
  warning: 'bg-brand-main', // 30초~11초 구간
  danger: 'bg-brand-sub3', // 10초 이하
  expired: 'bg-neutral-700', // 0초 이하
};

/**
 * 타이머 페이지의 상태(타이머, 라운드, 벨 등) 전반을 관리하는 커스텀 훅
 */
export function useTimerPageState(tableId: number) {
  const { data } = useGetDebateTableData(tableId);

  const [bg, setBg] = useState<TimerState>('default');

  // 추가 타이머가 가능한지 여부 (예: 사전에 설정한 "작전 시간"이 있으면 false)
  const isAdditionalTimerAvailable = useMemo(() => {
    if (data) {
      return data.table.every((value) => {
        if (value.speechType !== '작전 시간') {
          return true;
        }
        return false;
      });
    }
    return true;
  }, [data]);

  // 현재 진행 중인 토론 순서 인덱스
  const [index, setIndex] = useState(0);

  // 자유토론 타이머, 일반 타이머 상태 관리 커스텀 훅
  const timer1 = useCustomTimer({});
  const timer2 = useCustomTimer({});
  const normalTimer = useNormalTimer();

  // 현재 발언자('pros'/'cons')
  const [prosConsSelected, setProsConsSelected] = useState<'pros' | 'cons'>(
    'pros',
  );

  // 벨 사운드 관련 훅 (벨 ref 제공)
  const { warningBellRef, finishBellRef } = useBellSound({
    timer1,
    timer2,
    normalTimer,
    isWarningBell: data?.info.warningBell,
    isFinishBell: data?.info.finishBell,
  });

  /**
   * 라운드 이동 (이전/다음)
   */
  const goToOtherItem = useCallback(
    (isPrev: boolean) => {
      if (isPrev) {
        if (index > 0) {
          setIndex((prev) => prev - 1);
        }
      } else {
        if (data && index < data.table.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }
    },
    [index, data],
  );

  /**
   * 발언 진영 전환(ENTER 키/버튼)
   * - pros → cons, cons → pros로 타이머/상태 전환
   */
  const switchCamp = useCallback(() => {
    if (prosConsSelected === 'pros') {
      if (timer2.isDone) return; // 상대 팀 발언 종료시 전환 불가
      if (timer1.isRunning) {
        timer1.pauseTimer();
        timer2.startTimer();
        setProsConsSelected('cons');
      } else {
        timer1.pauseTimer();
        setProsConsSelected('cons');
      }
    } else if (prosConsSelected === 'cons') {
      if (timer1.isDone) return;
      if (timer2.isRunning) {
        if (timer1.isDone) return;
        timer2.pauseTimer();
        timer1.startTimer();
        setProsConsSelected('pros');
      } else {
        timer2.pauseTimer();
        setProsConsSelected('pros');
      }
    }
  }, [prosConsSelected, timer1, timer2]);

  /**
   * 현재 라운드/타이머 상태 변화에 따라 배경 상태(bg) 자동 변경
   */
  useEffect(() => {
    // 각 타이머별 상태에 따라 warning/danger/expired 판정
    const getBgStatus = () => {
      const boxType = data?.table[index].boxType;

      // 발언 타이머 기준 상태 산정 함수
      const getTimerStatus = (
        speakingTimer: number | null,
        totalTimer: number | null,
      ) => {
        const activeTimer = speakingTimer !== null ? speakingTimer : totalTimer;
        if (activeTimer !== null) {
          if (activeTimer > 10 && activeTimer <= 30) return 'warning';
          if (activeTimer >= 0 && activeTimer <= 10) return 'danger';
        }
        return 'default';
      };

      if (boxType === 'NORMAL') {
        if (!normalTimer.isRunning) return 'default';
        if (normalTimer.timer !== null) {
          if (normalTimer.timer > 10 && normalTimer.timer <= 30)
            return 'warning';
          if (normalTimer.timer >= 0 && normalTimer.timer <= 10)
            return 'danger';
          if (normalTimer.timer < 0) return 'expired';
          return 'default';
        }
      }
      if (boxType === 'TIME_BASED') {
        if (prosConsSelected === 'pros' && timer1.isRunning) {
          return getTimerStatus(timer1.speakingTimer, timer1.totalTimer);
        }
        if (prosConsSelected === 'cons' && timer2.isRunning) {
          return getTimerStatus(timer2.speakingTimer, timer2.totalTimer);
        }
      }
      return 'default';
    };
    setBg(getBgStatus());
  }, [
    normalTimer.isRunning,
    normalTimer.timer,
    timer1.isRunning,
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.isRunning,
    timer2.totalTimer,
    timer2.speakingTimer,
    prosConsSelected,
    index,
    data,
  ]);

  /**
   * 라운드 이동/초기 진입 시 타이머 상태 초기화 및 셋업
   */
  useEffect(() => {
    if (!data) return;
    const currentBox = data.table[index];
    timer1.clearTimer();
    timer2.clearTimer();
    normalTimer.clearTimer();
    normalTimer.handleCloseAdditionalTimer();

    // 일반 타이머(중립 발언 등)
    if (currentBox.boxType === 'NORMAL') {
      const defaultTime = currentBox.time ?? 0;
      normalTimer.setDefaultTimer(defaultTime);
      normalTimer.setTimer(defaultTime);
    }
    // 진영별 타이머(찬/반)
    else if (currentBox.boxType === 'TIME_BASED') {
      normalTimer.clearTimer();
      const defaultTotalTimer = currentBox.timePerTeam;
      const defaultSpeakingTimer = currentBox.timePerSpeaking;
      [timer1, timer2].forEach((timer) => {
        timer.setDefaultTime({ defaultTotalTimer, defaultSpeakingTimer });
        timer.setTimers(defaultTotalTimer, defaultSpeakingTimer);
        timer.setIsSpeakingTimer(true);
        timer.setIsDone(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    index,
    timer1.setDefaultTime,
    timer1.setTimers,
    timer2.setDefaultTime,
    timer2.setTimers,
    normalTimer.setDefaultTimer,
    normalTimer.setTimer,
  ]);

  /**
   * 진영 전환 시, 상대 타이머를 발언 구간에 맞게 초기화
   */
  useEffect(() => {
    if (prosConsSelected === 'cons') {
      if (timer1.speakingTimer === null) return;
      timer1.resetTimerForNextPhase();
    } else if (prosConsSelected === 'pros') {
      if (timer2.speakingTimer === null) return;
      timer2.resetTimerForNextPhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prosConsSelected]);

  /**
   * 각 타이머가 종료 시 자동으로 타이머 일시정지
   */
  useEffect(() => {
    if (timer1.speakingTimer === 0 || timer1.totalTimer === 0) {
      timer1.pauseTimer();
    } else if (timer2.speakingTimer === 0 || timer2.totalTimer === 0) {
      timer2.pauseTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timer1.speakingTimer,
    timer1.totalTimer,
    timer2.speakingTimer,
    timer2.totalTimer,
  ]);

  /**
   * 각 진영의 타이머가 완전히 끝난 경우(isDone 처리)
   */
  useEffect(() => {
    if (prosConsSelected === 'pros') {
      if (timer1.speakingTimer === null) {
        if (timer1.totalTimer === 0) {
          timer1.setIsDone(true);
        }
      } else {
        if (timer1.speakingTimer === 0) {
          timer1.setIsDone(true);
        }
      }
    } else if (prosConsSelected === 'cons') {
      if (timer2.speakingTimer === null) {
        if (timer2.totalTimer === 0) {
          timer2.setIsDone(true);
        }
      } else {
        if (timer2.speakingTimer === 0) {
          timer2.setIsDone(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prosConsSelected,
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.totalTimer,
    timer2.speakingTimer,
  ]);

  return {
    warningBellRef,
    finishBellRef,
    data,
    bg,
    setBg,
    isAdditionalTimerAvailable,
    index,
    setIndex,
    timer1,
    timer2,
    normalTimer,
    prosConsSelected,
    setProsConsSelected,
    goToOtherItem,
    switchCamp,
    isGuestFlow,
    tableId,
  };
}

export type UseTimerPageStateReturnType = ReturnType<typeof useTimerPageState>;
