import { useEffect, useState } from 'react';
import { NormalTimerLogics } from './useNormalTimer';
import { BellConfig } from '../../../type/type';

interface UseBellSoundProps {
  normalTimer: NormalTimerLogics;
  bells?: BellConfig[] | null;
}

export function useBellSound({ normalTimer, bells }: UseBellSoundProps) {
  const [volume, setVolume] = useState<number>(1.0);

  // 종소리 여러 번 - 새로운 Audio로 재생
  function playBell(count: number) {
    const audio = new Audio(`/sounds/bell-${count}.mp3`);
    audio.volume = volume;
    audio.play().catch((err) => {
      console.warn('audio.play() 실패:', err);
    });
  }

  useEffect(() => {
    const timerVal = normalTimer.timer;
    const defaultTime = normalTimer.defaultTimer;
    if (!bells || timerVal == null) return;

    bells.forEach((bell) => {
      let trigger = false;

      if (bell.type === 'BEFORE_END') {
        // timerVal이 남은 시간 === bell.time일 때
        trigger = timerVal === bell.time;
      } else if (bell.type === 'AFTER_END') {
        // timerVal이 0보다 작아진 후, timerVal === bell.time (bell.time < 0)
        trigger = timerVal === bell.time;
      } else if (bell.type === 'AFTER_START') {
        // 시작 후 N초: timerVal === defaultTime - bell.time
        trigger = timerVal === defaultTime - bell.time;
      }

      if (trigger) {
        playBell(bell.count);
      }
    });
  }, [normalTimer.timer, bells, normalTimer.defaultTimer, volume]);

  return { volume, setVolume };
}
