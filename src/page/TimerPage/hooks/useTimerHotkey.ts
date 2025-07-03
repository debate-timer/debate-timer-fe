import { useEffect } from 'react';
import { UseTimerPageStateReturnType } from './useTimerPageState';

export function useTimerHotkey(state: UseTimerPageStateReturnType) {
  const {
    data,
    index,
    prosConsSelected,
    timer1,
    timer2,
    normalTimer,
    goToOtherItem,
    setProsConsSelected,
    switchCamp,
  } = state;

  useEffect(() => {
    if (!data) return;

    const boxType = data.table[index].boxType;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keysToDisable = [
        'Space',
        'ArrowLeft',
        'ArrowRight',
        'KeyR',
        'KeyA',
        'KeyL',
        'Enter',
      ];

      if (keysToDisable.includes(event.code)) {
        event.preventDefault();
      }
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      const toggleTimer = (timer: typeof timer1 | typeof timer2) => {
        if (timer.isRunning) {
          timer.pauseTimer();
        } else {
          timer.startTimer();
        }
      };

      switch (event.code) {
        case 'Space':
          if (boxType === 'NORMAL') {
            if (normalTimer.isRunning) {
              normalTimer.pauseTimer();
            } else {
              normalTimer.startTimer();
            }
          } else {
            if (prosConsSelected === 'pros') {
              toggleTimer(timer1);
            } else if (prosConsSelected === 'cons') {
              toggleTimer(timer2);
            }
          }
          break;
        case 'ArrowLeft':
          goToOtherItem(true);
          break;
        case 'ArrowRight':
          goToOtherItem(false);
          break;
        case 'KeyR':
          if (boxType === 'NORMAL') {
            normalTimer.resetTimer();
          } else {
            if (prosConsSelected === 'pros') {
              timer1.resetCurrentTimer();
            } else {
              timer2.resetCurrentTimer();
            }
          }
          break;
        case 'KeyA':
          if (!timer1.isDone) {
            setProsConsSelected('pros');
            if (timer2.isRunning) timer2.pauseTimer();
          }
          break;
        case 'KeyL':
          if (!timer2.isDone) {
            setProsConsSelected('cons');
            if (timer1.isRunning) timer1.pauseTimer();
          }
          break;
        case 'Enter':
          switchCamp();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    data,
    index,
    prosConsSelected,
    timer1,
    timer2,
    normalTimer,
    goToOtherItem,
    setProsConsSelected,
    switchCamp,
  ]);
}
