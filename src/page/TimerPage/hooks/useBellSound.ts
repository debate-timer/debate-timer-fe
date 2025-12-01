import { useEffect, useRef, useState } from 'react';
import { NormalTimerLogics } from './useNormalTimer';
import { BellConfig } from '../../../type/type';

interface UseBellSoundProps {
  normalTimer: NormalTimerLogics;
  bells?: BellConfig[] | null;
}

const STORAGE_KEY = 'timer-volume';

export function useBellSound({ normalTimer, bells }: UseBellSoundProps) {
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        // NaN 등의 손상된 값 검증
        const parsed = Number(saved);
        return Number.isFinite(parsed) ? parsed : 1.0;
      }
      return 1.0;
    }
    return 1.0;
  });
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // 종소리 여러 번 - 새로운 Audio로 재생
  function playBell(count: number) {
    const audio = new Audio(`/sounds/bell-${count}.mp3`);
    audio.volume = volumeRef.current;
    audio.play().catch((err) => {
      console.warn('audio.play() 실패:', err);
    });
  }

  // 볼륨 변경 시 최신 값을 로컬 저장소에 저장
  // 500 ms 디바운싱 적용하여 성능 문제 예방
  useEffect(() => {
    const timerId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, volume.toString());
    }, 500);

    return () => clearTimeout(timerId);
  }, [volume]);

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
  }, [normalTimer.timer, bells, normalTimer.defaultTimer]);

  return { volume, setVolume };
}
