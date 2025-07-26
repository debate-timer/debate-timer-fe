import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useGetDebateTableData } from '../../../hooks/query/useGetDebateTableData';
import { TimeBasedTimerLogics, useTimeBasedTimer } from './useTimeBasedTimer';
import { NormalTimerLogics, useNormalTimer } from './useNormalTimer';
import { useBellSound } from './useBellSound';
import {
  DebateTableData,
  TimeBasedStance,
  TimerBGState,
} from '../../../type/type';
import { useTimerBackground } from './useTimerBackground';

/**
 * 타이머 페이지의 상태(타이머, 라운드, 벨 등) 전반을 관리하는 커스텀 훅
 */
export function useTimerPageState(tableId: number): TimerPageLogics {
  const { data } = useGetDebateTableData(tableId);

  // 추가 타이머가 가능한지 여부 (예: 사전에 설정한 "작전 시간"이 있으면 false)
  const isAdditionalTimerAvailable = useMemo(() => {
    if (data) {
      return !data.table.some((value) => value.speechType === '작전 시간');
    }
    return true;
  }, [data]);

  // 현재 진행 중인 토론 순서 인덱스
  const [index, setIndex] = useState(0);

  // 자유토론 타이머, 일반 타이머 상태 관리 커스텀 훅
  const timer1 = useTimeBasedTimer({});
  const timer2 = useTimeBasedTimer({});
  const normalTimer = useNormalTimer();

  // 현재 발언자('PROS'/'CONS')
  const [prosConsSelected, setProsConsSelected] =
    useState<TimeBasedStance>('PROS');

  // 벨 사운드 관련 훅 (벨 ref 제공)
  const { warningBellRef, finishBellRef } = useBellSound({
    timer1,
    timer2,
    normalTimer,
    isWarningBell: data?.info.warningBell,
    isFinishBell: data?.info.finishBell,
  });

  const { bg, setBg } = useTimerBackground({
    timer1,
    timer2,
    normalTimer,
    prosConsSelected,
    data,
    index,
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
   * 특정 진영(팀)을 활성화하는 함수
   * - 사용자가 좌/우 타이머 영역을 직접 클릭할 때 사용
   * - 현재 진영이 아닌 타이머를 클릭한 경우에만 동작
   */
  const handleActivateTeam = useCallback(
    (team: TimeBasedStance) => {
      const isPros = team === 'PROS';
      const currentTimer = isPros ? timer1 : timer2;
      const otherTimer = isPros ? timer2 : timer1;
      if (currentTimer.isDone || prosConsSelected === team) return;

      otherTimer.pauseTimer();
      if (otherTimer.isRunning) {
        currentTimer.startTimer();
      }
      setProsConsSelected(team);
    },
    [prosConsSelected, timer1, timer2],
  );

  /**
   * 발언 진영 전환(ENTER 키/버튼)
   * - pros → cons, cons → pros로 타이머/상태 전환
   */
  const switchCamp = useCallback(() => {
    const currentTimer = prosConsSelected === 'PROS' ? timer1 : timer2;
    const nextTimer = prosConsSelected === 'PROS' ? timer2 : timer1;
    const nextTeam = prosConsSelected === 'PROS' ? 'CONS' : 'PROS';
    if (nextTimer.isDone) return;
    currentTimer.pauseTimer();
    if (!nextTimer.isDone && currentTimer.isRunning) {
      nextTimer.startTimer();
    }
    setProsConsSelected(nextTeam);
  }, [prosConsSelected, timer1, timer2]);

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
        timer.setSavedTime({
          savedTotalTimer: defaultTotalTimer,
          savedSpeakingTimer: defaultSpeakingTimer,
        });
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
    const isPros = prosConsSelected === 'PROS';
    const myTimer = isPros ? timer1 : timer2;
    const opponentTimer = isPros ? timer2 : timer1;
    if (myTimer.speakingTimer === null) return;
    myTimer.resetTimerForNextPhase(opponentTimer.isDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prosConsSelected]);

  /**
   * 각 타이머가 종료 시 자동으로 타이머 일시정지
   */
  useEffect(() => {
    [timer1, timer2].forEach((timer) => {
      if (timer.speakingTimer === 0 || timer.totalTimer === 0) {
        timer.pauseTimer();
      }
    });
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
    const selectedTimer = prosConsSelected === 'PROS' ? timer1 : timer2;

    const isDone =
      selectedTimer.speakingTimer === null
        ? selectedTimer.totalTimer === 0
        : selectedTimer.speakingTimer === 0;

    if (isDone) {
      selectedTimer.setIsDone(true);
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
    handleActivateTeam,
    tableId,
  };
}

export interface TimerPageLogics {
  warningBellRef: RefObject<HTMLAudioElement>;
  finishBellRef: RefObject<HTMLAudioElement>;
  data: DebateTableData | undefined;
  bg: TimerBGState;
  setBg: Dispatch<SetStateAction<TimerBGState>>;
  isAdditionalTimerAvailable: boolean;
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  timer1: TimeBasedTimerLogics;
  timer2: TimeBasedTimerLogics;
  normalTimer: NormalTimerLogics;
  prosConsSelected: TimeBasedStance;
  setProsConsSelected: Dispatch<SetStateAction<TimeBasedStance>>;
  goToOtherItem: (isPrev: boolean) => void;
  switchCamp: () => void;
  handleActivateTeam: (team: TimeBasedStance) => void;
  tableId: number;
}
