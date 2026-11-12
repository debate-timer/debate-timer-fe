import { useCallback, useEffect, useRef } from 'react';
import { NormalTimerLogics } from './useNormalTimer';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import { BellConfig } from '../../../types/type';

interface UseBellSoundProps {
  normalTimer: NormalTimerLogics;
  bells?: BellConfig[] | null;
}

export function useBellSound({ normalTimer, bells }: UseBellSoundProps) {
  const { volume, controller } = useGlobalSettings();
  const updateVolume = (value: number) => {
    if (Number.isFinite(value) && value >= 0 && value <= 1) {
      controller.change({ volume: Math.round(value * 10) / 10 });
    }
  };
  const volumeRef = useRef(volume);
  // playBell과 같은 콜백 함수에서 최신 volume 값을 참조하기 위해 ref를 동기화
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // 종소리 여러 번 - 새로운 Audio로 재생
  const playBell = useCallback((count: number) => {
    const audio = new Audio(`/sounds/bell-${count}.mp3`);
    audio.volume = volumeRef.current;
    audio.play().catch((err) => {
      console.warn('audio.play() 실패:', err);
    });
  }, []);

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
  }, [normalTimer.timer, bells, normalTimer.defaultTimer, playBell]);

  return { volume, updateVolume };
}
