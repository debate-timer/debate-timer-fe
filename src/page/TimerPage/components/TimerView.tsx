// components/TimerView.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SocketEventType } from '../../../apis/sockets/type';
import DTExchange from '../../../components/icons/Exchange';
import { TimerPageLogics } from '../hooks/useTimerPageState';
import AnswerTimeProgress from './AnswerTimeProgress';
import NormalTimer from './NormalTimer';
import TimeBasedTimer from './TimeBasedTimer';

type AnswerTimerOwner = 'NORMAL' | 'PROS' | 'CONS';
type AnswerTimerStatus = 'running' | 'stopped';

interface AnswerTimerState {
  owner: AnswerTimerOwner;
  status: AnswerTimerStatus;
  elapsedTime: number;
}

interface TimerViewProps {
  state: TimerPageLogics;
  onEvent: (invoke: () => void, eventType: SocketEventType) => void;
  answerTime: number;
}

export default function TimerView({
  state,
  onEvent,
  answerTime,
}: TimerViewProps) {
  const { t } = useTranslation();
  // 상태 풀기
  const {
    data,
    normalTimer,
    timer1,
    timer2,
    prosConsSelected,
    index,
    isAdditionalTimerAvailable,
    handleActivateTeam,
    switchCamp,
  } = state;
  const [answerTimerState, setAnswerTimerState] =
    useState<AnswerTimerState | null>(null);

  const handleClickAnswerTimer = (
    owner: AnswerTimerOwner,
    isMainTimerRunning: boolean,
  ) => {
    setAnswerTimerState((currentState) => {
      if (currentState?.owner !== owner) {
        if (!isMainTimerRunning) {
          return currentState;
        }

        return { owner, status: 'running', elapsedTime: 0 };
      }

      if (currentState.status === 'running') {
        return { ...currentState, status: 'stopped' };
      }

      return null;
    });
  };

  useEffect(() => {
    if (answerTimerState?.status !== 'running') return;

    const intervalId = window.setInterval(() => {
      setAnswerTimerState((currentState) => {
        if (currentState?.status !== 'running') {
          return currentState;
        }

        const nextElapsedTime = Number(
          (currentState.elapsedTime + 0.1).toFixed(1),
        );

        if (nextElapsedTime >= answerTime) {
          return {
            ...currentState,
            status: 'stopped',
            elapsedTime: answerTime,
          };
        }

        return {
          ...currentState,
          elapsedTime: nextElapsedTime,
        };
      });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [answerTime, answerTimerState?.status]);

  const getAnswerTimer = (
    owner: AnswerTimerOwner,
    isMainTimerRunning: boolean,
  ) => {
    if (answerTimerState?.owner === owner) {
      return (
        <AnswerTimeProgress
          answerTime={answerTime}
          elapsedTime={answerTimerState.elapsedTime}
          onClick={() => handleClickAnswerTimer(owner, isMainTimerRunning)}
        />
      );
    }

    return (
      <button
        type="button"
        className={
          'flex h-[40px] w-[168px] flex-shrink-0 items-center justify-center self-center rounded-[44px] border border-default-disabled/hover bg-default-white font-semibold leading-none text-default-neutral xl:w-[208px]'
        }
        aria-disabled={!isMainTimerRunning}
        onClick={() => handleClickAnswerTimer(owner, isMainTimerRunning)}
      >
        {t('답변시간 타이머 시작')}
      </button>
    );
  };

  // 일반 타이머
  if (data && data.table[index].boxType === 'NORMAL') {
    return (
      <NormalTimer
        normalTimerInstance={{
          timer: normalTimer.timer,
          isAdditionalTimerOn: normalTimer.isAdditionalTimerOn,
          isRunning: normalTimer.isRunning,
          handleChangeAdditionalTimer: normalTimer.handleChangeAdditionalTimer,
          handleCloseAdditionalTimer: normalTimer.handleCloseAdditionalTimer,
          startTimer: () => onEvent(normalTimer.startTimer, 'PLAY'),
          pauseTimer: () => onEvent(normalTimer.pauseTimer, 'STOP'),
          resetTimer: () => onEvent(normalTimer.resetTimer, 'RESET'),
          setTimer: normalTimer.setTimer,
        }}
        isAdditionalTimerAvailable={isAdditionalTimerAvailable}
        item={data.table[index]}
        answerTimer={getAnswerTimer('NORMAL', normalTimer.isRunning)}
        teamName={
          data.table[index].stance === 'NEUTRAL'
            ? null
            : data.table[index].stance === 'PROS'
              ? data.info.prosTeamName
              : data.info.consTeamName
        }
      />
    );
  }

  // 자유 토론 타이머
  if (data && data.table[index].boxType === 'TIME_BASED') {
    return (
      <div className="flex flex-row items-center justify-center space-x-[30px]">
        {/* 왼쪽 타이머 */}
        <TimeBasedTimer
          timeBasedTimerInstance={{
            totalTimer: timer1.totalTimer,
            speakingTimer: timer1.speakingTimer,
            isRunning: timer1.isRunning,
            startTimer: () => onEvent(timer1.startTimer, 'PLAY'),
            pauseTimer: () => onEvent(timer1.pauseTimer, 'STOP'),
            resetCurrentTimer: () =>
              onEvent(() => timer1.resetCurrentTimer(timer2.isDone), 'RESET'),
          }}
          item={data.table[index]}
          isSelected={prosConsSelected === 'PROS'}
          onActivate={() =>
            handleActivateTeam('PROS', (invoke) =>
              onEvent(invoke, 'TEAM_SWITCH'),
            )
          }
          prosCons="PROS"
          teamName={data.info.prosTeamName}
          answerTimer={getAnswerTimer('PROS', timer1.isRunning)}
        />

        {/* ENTER 버튼 */}
        <button
          onClick={() => onEvent(switchCamp, 'TEAM_SWITCH')}
          className="flex flex-col items-center justify-center rounded-[14px] bg-default-black2 px-[16px] py-[8px] text-default-white shadow-xl xl:px-[32px]"
        >
          <DTExchange className="size-[48px] xl:size-[64px]" />
          <p className="text-[12px] font-semibold xl:text-[24px]">ENTER</p>
        </button>

        {/* 오른쪽 타이머 */}
        <TimeBasedTimer
          timeBasedTimerInstance={{
            totalTimer: timer2.totalTimer,
            speakingTimer: timer2.speakingTimer,
            isRunning: timer2.isRunning,
            startTimer: () => onEvent(timer2.startTimer, 'PLAY'),
            pauseTimer: () => onEvent(timer2.pauseTimer, 'STOP'),
            resetCurrentTimer: () =>
              onEvent(() => timer2.resetCurrentTimer(timer1.isDone), 'RESET'),
          }}
          item={data.table[index]}
          isSelected={prosConsSelected === 'CONS'}
          onActivate={() =>
            handleActivateTeam('CONS', (invoke) =>
              onEvent(invoke, 'TEAM_SWITCH'),
            )
          }
          prosCons="CONS"
          teamName={data.info.consTeamName}
          answerTimer={getAnswerTimer('CONS', timer2.isRunning)}
        />
      </div>
    );
  }

  return null;
}
