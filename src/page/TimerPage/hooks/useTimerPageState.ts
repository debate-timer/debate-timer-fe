import {
  Dispatch,
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
import {
  DocumentWithFullscreen,
  HTMLElementWithFullscreen,
} from '../../../type/fullscreen';

/**
 * 타이머 페이지의 상태(타이머, 라운드, 벨 등) 전반을 관리하는 커스텀 훅
 */
export function useTimerPageState(tableId: number): TimerPageLogics {
  // Get data with useQuery of TanStack Query
  const {
    data,
    isLoading: isFetching,
    isError: isFetchingError,
    isRefetching,
    isRefetchError,
    refetch,
  } = useGetDebateTableData(tableId);
  const isLoading = isFetching || isRefetching;
  const isError = isFetchingError || isRefetchError;

  // 추가 타이머가 가능한지 여부 (예: 사전에 설정한 "작전 시간"이 있으면 false)
  const isAdditionalTimerAvailable = useMemo(() => {
    if (data) {
      return !data.table.some((value) => value.speechType === '작전 시간');
    }
    return true;
  }, [data]);

  // 현재 진행 중인 토론 순서 인덱스
  const [index, setIndex] = useState(0);

  // 전체 화면 여부
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 자유토론 타이머, 일반 타이머 상태 관리 커스텀 훅
  const timer1 = useTimeBasedTimer();
  const timer2 = useTimeBasedTimer();
  const normalTimer = useNormalTimer();

  // 현재 발언자('PROS'/'CONS')
  const [prosConsSelected, setProsConsSelected] =
    useState<TimeBasedStance>('PROS');

  // 벨 사운드 관련 훅
  useBellSound({
    normalTimer,
    bells: data?.table[index].bell,
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
   * 전체 화면 여부 토글
   */
  const toggleFullscreen = useCallback(async () => {
    const doc = document as DocumentWithFullscreen;
    const element = document.documentElement as HTMLElementWithFullscreen;

    try {
      const isCurrentlyFullscreen =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;

      if (!isCurrentlyFullscreen) {
        // 전체 화면 시작 (다양한 브라우저 지원)
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          /* Safari */
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          /* Firefox */
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          /* IE11 */
          await element.msRequestFullscreen();
        }
      } else {
        // 전체 화면 종료 (다양한 브라우저 지원)
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          /* Safari */
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          /* Firefox */
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          /* IE11 */
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('# Failed to toggle fullscreen mode:', error);
    }
  }, []);

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
    // 1. 현재 팀과 다음 팀의 정보 설정
    const currentTimer = prosConsSelected === 'PROS' ? timer1 : timer2;
    const nextTimer = prosConsSelected === 'PROS' ? timer2 : timer1;
    const nextTeam = prosConsSelected === 'PROS' ? 'CONS' : 'PROS';

    // 2. 상대 팀이 시간을 모두 소진했을 경우, 차례를 넘기지 않고 반환
    if (nextTimer.isDone) {
      return;
    }

    // 3. 현재 팀의 발언이 종료되었는지 확인
    const isOpponentDone =
      currentTimer.totalTimer !== null && currentTimer.totalTimer <= 0;

    // 4. 현재 타이머를 멈추기 전, 실행 중이었는지를 저장
    const wasRunning = currentTimer.isRunning;

    // 5. 이제 현재 타이머를 정지하고...
    currentTimer.pauseTimer();

    // 6. 발언권을 다음 팀에게 넘김 (현재 발언권 가진 팀을 다음 팀으로 설정)
    setProsConsSelected(nextTeam);

    if (wasRunning) {
      // 7-1. 만약 타이머가 실행 중이었다면, 다음 타이머 초기화 후 즉시 시작
      nextTimer.resetAndStartTimer(isOpponentDone);
    } else {
      // 7-1. 만약 타이머가 멈춰 있었다면, 다음 타이머 초기화만 진행
      nextTimer.resetTimerForNextPhase(isOpponentDone);
    }
  }, [prosConsSelected, timer1, timer2]);

  /**
   * 특정 진영(팀)을 활성화하는 함수
   * - 사용자가 좌/우 타이머 영역을 직접 클릭할 때 사용
   * - 현재 진영이 아닌 타이머를 클릭한 경우에만 동작
   */
  const handleActivateTeam = useCallback(
    (team: TimeBasedStance) => {
      const clickedTimerStance = team === 'PROS' ? 'PROS' : 'CONS';
      const clickedTimer = clickedTimerStance === 'PROS' ? timer1 : timer2;

      // 클릭한 타이머가 현재 타이머와 동일한 타이머라면, 바로 반환
      if (prosConsSelected === clickedTimerStance) return;

      // 아니라면, 타이머 변경
      if (clickedTimer.isDone) {
        setProsConsSelected(clickedTimerStance);
      } else {
        switchCamp();
      }
    },
    [prosConsSelected, switchCamp, timer1, timer2],
  );

  /**
   * 전체 화면 상태 변경을 감지
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as DocumentWithFullscreen;
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        ),
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, []);

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
   * 진영 전환 시, 상대 타이머가 작동가능하면 isDone false로 변경
   */
  useEffect(() => {
    const isPros = prosConsSelected === 'PROS';
    const opponentTimer = isPros ? timer2 : timer1;
    if (opponentTimer.totalTimer !== null && opponentTimer.totalTimer > 0) {
      opponentTimer.setIsDone(false);
    }
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
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.totalTimer,
    timer2.speakingTimer,
  ]);

  return {
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
    isLoading,
    isError,
    refetch,
    isFullscreen,
    toggleFullscreen,
  };
}

export interface TimerPageLogics {
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
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}
