import { useEffect, useRef, useState } from 'react';
import { NormalTimerLogics } from './useNormalTimer';
import { BellConfig } from '../../../type/type';

interface UseBellSoundProps {
  normalTimer: NormalTimerLogics;
  bells?: BellConfig[] | null;
}

const STORAGE_KEY = 'timer-volume';

export function useBellSound({ normalTimer, bells }: UseBellSoundProps) {
  // 볼륨 초기화 함수
  const getAndInitVolume = () => {
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
  };

  const [volume, setVolume] = useState<number>(() => getAndInitVolume());
  const volumeRef = useRef(volume);

  /** 안전하게 볼륨 값을 갱신하는 함수.
   *  값이 정상적이지 않을 경우, 일괄 0.5로 초기화합니다.
   *  @param value 갱신할 볼륨 값 (실수 0.0부터 1.0 사이)
   */
  const updateVolume = (value: number) => {
    if (
      value === null ||
      Number.isNaN(value) ||
      !Number.isFinite(value) ||
      value < 0.0 ||
      value > 1.0
    ) {
      setVolume(0.5);
    }
    setVolume(value);
  };

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

  return { volume, updateVolume };
}
