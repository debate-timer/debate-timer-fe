import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDebateTableData } from '../../../hooks/query/useGetDebateTableData';
import { useModal } from '../../../hooks/useModal';
import { useCustomTimer } from './useCustomTimer';
import { useNormalTimer } from './useNormalTimer';
import { oAuthLogin } from '../../../util/googleAuth';
import { isGuestFlow } from '../../../util/sessionStorage';
import { useBellSound } from './useBellSound';

// 배경색 상태 타입 및 맵핑 정의
export type TimerState = 'default' | 'warning' | 'danger' | 'expired';
export const bgColorMap: Record<TimerState, string> = {
  default: '',
  warning: 'bg-brand-main',
  danger: 'bg-brand-sub3',
  expired: 'bg-neutral-700',
};

export function useTimerPageState(tableId: number) {
  const navigate = useNavigate();
  const { data } = useGetDebateTableData(tableId);

  const [isFirst, setIsFirst] = useState(false);
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';
  const {
    openModal: openUseTooltipModal,
    closeModal: closeUseTooltipModal,
    ModalWrapper: UseToolTipWrapper,
  } = useModal({
    onClose: () => {
      setIsFirst(false);
      localStorage.setItem(IS_FIRST, FALSE);
    },
    isCloseButtonExist: false,
  });
  const {
    openModal: openLoginAndStoreModal,
    closeModal: closeLoginAndStoreModal,
    ModalWrapper: LoginAndStoreModalWrapper,
  } = useModal();

  const [bg, setBg] = useState<TimerState>('default');
  const [isAdditionalTimerOn, setIsAdditionalTimerOn] = useState(false);
  const [savedTimer, saveTimer] = useState(0);
  const [isTimerChangeable, setIsTimerChangeable] = useState(true);
  const [index, setIndex] = useState(0);

  const timer1 = useCustomTimer({});
  const timer2 = useCustomTimer({});
  const normalTimer = useNormalTimer();
  const [prosConsSelected, setProsConsSelected] = useState<'pros' | 'cons'>(
    'pros',
  );

  // ✅ 벨 사운드 훅 사용
  const { warningBellRef, finishBellRef, setWarningBell, setFinishBell } =
    useBellSound({
      timer1,
      timer2,
      normalTimer,
    });

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

  const switchCamp = useCallback(() => {
    if (prosConsSelected === 'pros') {
      if (timer2.isDone) return;
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

  // --- useEffect 모음 ---

  useEffect(() => {
    const storedIsFirst = localStorage.getItem(IS_FIRST);
    if (storedIsFirst === null) {
      setIsFirst(true);
    } else {
      setIsFirst(storedIsFirst.trim() === TRUE ? true : false);
    }
    if (isFirst) {
      openUseTooltipModal();
    }
  }, [isFirst, openUseTooltipModal]);

  useEffect(() => {
    const getBgStatus = () => {
      const boxType = data?.table[index].boxType;
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

  useEffect(() => {
    if (!data) return;
    const currentBox = data.table[index];
    const { warningBell, finishBell } = data.info;
    setWarningBell(warningBell);
    setFinishBell(finishBell);
    timer1.clearTimer();
    timer2.clearTimer();
    normalTimer.clearTimer();
    if (currentBox.boxType === 'NORMAL') {
      const defaultTime = currentBox.time ?? 0;
      normalTimer.setDefaultTimer(defaultTime);
      normalTimer.setTimer(defaultTime);
    } else if (currentBox.boxType === 'TIME_BASED') {
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

  useEffect(() => {
    if (data) {
      data.table.forEach((value) => {
        if (value.speechType === '작전 시간') {
          setIsTimerChangeable(false);
        }
      });
    }
  });

  useEffect(() => {
    if (
      isAdditionalTimerOn &&
      normalTimer.timer === 0 &&
      normalTimer.isRunning
    ) {
      normalTimer.pauseTimer();
      normalTimer.setTimer(savedTimer);
      setIsAdditionalTimerOn(!isAdditionalTimerOn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAdditionalTimerOn,
    normalTimer.timer,
    savedTimer,
    normalTimer.pauseTimer,
    setIsAdditionalTimerOn,
    normalTimer.setTimer,
    normalTimer.isRunning,
  ]);

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
    setWarningBell,
    setFinishBell,
    navigate,
    data,
    isFirst,
    setIsFirst,
    IS_FIRST,
    TRUE,
    FALSE,
    openUseTooltipModal,
    closeUseTooltipModal,
    UseToolTipWrapper,
    openLoginAndStoreModal,
    closeLoginAndStoreModal,
    LoginAndStoreModalWrapper,
    bg,
    setBg,
    isAdditionalTimerOn,
    setIsAdditionalTimerOn,
    savedTimer,
    saveTimer,
    isTimerChangeable,
    setIsTimerChangeable,
    index,
    setIndex,
    timer1,
    timer2,
    normalTimer,
    prosConsSelected,
    setProsConsSelected,
    goToOtherItem,
    switchCamp,
    oAuthLogin,
    isGuestFlow,
    tableId,
  };
}

export type UseTimerPageStateReturnType = ReturnType<typeof useTimerPageState>;
