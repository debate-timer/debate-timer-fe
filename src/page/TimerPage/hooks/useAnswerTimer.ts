import { useCallback, useEffect, useRef, useState } from 'react';
import { DebateTableData, TimeBasedStance } from '../../../type/type';
import { NormalTimerLogics } from './useNormalTimer';
import { TimeBasedTimerLogics } from './useTimeBasedTimer';

export type AnswerTimerOwner = 'NORMAL' | 'PROS' | 'CONS';

type AnswerTimerStatus = 'running' | 'stopped' | 'resetting';

export interface AnswerTimerState {
  owner: AnswerTimerOwner;
  status: AnswerTimerStatus;
  elapsedTime: number;
}

interface UseAnswerTimerParams {
  answerTime: number;
  data: DebateTableData | undefined;
  index: number;
  normalTimer: NormalTimerLogics;
  timer1: TimeBasedTimerLogics;
  timer2: TimeBasedTimerLogics;
  prosConsSelected: TimeBasedStance;
}

export function useAnswerTimer({
  answerTime,
  data,
  index,
  normalTimer,
  timer1,
  timer2,
  prosConsSelected,
}: UseAnswerTimerParams) {
  const [answerTimerState, setAnswerTimerState] =
    useState<AnswerTimerState | null>(null);
  const previousProsConsSelectedRef = useRef(prosConsSelected);
  const answerTimerOwner = answerTimerState?.owner;
  const isAnswerTimerMainTimerRunning =
    answerTimerOwner === 'NORMAL'
      ? normalTimer.isRunning
      : answerTimerOwner === 'PROS'
        ? timer1.isRunning
        : answerTimerOwner === 'CONS'
          ? timer2.isRunning
          : true;

  const resetAnswerTimer = useCallback(() => {
    setAnswerTimerState((currentState) => {
      if (!currentState) return currentState;

      return { ...currentState, status: 'resetting', elapsedTime: 0 };
    });
  }, []);

  const handleClickAnswerTimer = useCallback(
    (owner: AnswerTimerOwner, isMainTimerRunning: boolean) => {
      setAnswerTimerState((currentState) => {
        if (currentState?.owner !== owner) {
          if (!isMainTimerRunning) return currentState;

          return { owner, status: 'running', elapsedTime: 0 };
        }

        if (currentState.status === 'running') {
          return { ...currentState, status: 'stopped' };
        }

        return { ...currentState, status: 'resetting', elapsedTime: 0 };
      });
    },
    [],
  );

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

  useEffect(() => {
    if (answerTimerState?.status !== 'resetting') return;

    const timeoutId = window.setTimeout(() => {
      setAnswerTimerState((currentState) => {
        if (currentState?.status !== 'resetting') return currentState;

        return null;
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [answerTimerState?.status]);

  useEffect(() => {
    if (!answerTimerOwner || isAnswerTimerMainTimerRunning) return;

    resetAnswerTimer();
  }, [answerTimerOwner, isAnswerTimerMainTimerRunning, resetAnswerTimer]);

  useEffect(() => {
    if (previousProsConsSelectedRef.current === prosConsSelected) return;

    previousProsConsSelectedRef.current = prosConsSelected;

    if (answerTimerOwner !== 'PROS' && answerTimerOwner !== 'CONS') return;

    resetAnswerTimer();
  }, [answerTimerOwner, prosConsSelected, resetAnswerTimer]);

  useEffect(() => {
    if (!data) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'ShiftLeft' && event.code !== 'ShiftRight') return;
      if (event.repeat) return;

      event.preventDefault();

      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      const boxType = data.table[index].boxType;

      if (boxType === 'NORMAL') {
        handleClickAnswerTimer('NORMAL', normalTimer.isRunning);
        return;
      }

      if (prosConsSelected === 'PROS') {
        handleClickAnswerTimer('PROS', timer1.isRunning);
        return;
      }

      handleClickAnswerTimer('CONS', timer2.isRunning);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    data,
    handleClickAnswerTimer,
    index,
    normalTimer.isRunning,
    prosConsSelected,
    timer1.isRunning,
    timer2.isRunning,
  ]);

  return {
    answerTimerState,
    handleClickAnswerTimer,
  };
}
