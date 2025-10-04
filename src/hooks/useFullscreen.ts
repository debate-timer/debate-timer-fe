import { useCallback, useLayoutEffect, useState } from 'react';
import {
  DocumentWithFullscreen,
  HTMLElementWithFullscreen,
} from '../type/fullscreen';

// 헬퍼 함수: 현재 전체 화면 요소가 무엇인지 반환 (없으면 null)
const getFullscreenElement = (): Element | null => {
  const doc = document as DocumentWithFullscreen;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
};

// 헬퍼 함수: 전체 화면 진입
const enterFullscreen = async (element: HTMLElementWithFullscreen) => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen(); // Safari
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen(); // Firefox
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen(); // IE11
    }
  } catch (error) {
    console.error('# Failed to enter fullscreen mode:', error);
  }
};

// 헬퍼 함수: 전체 화면 해제
const exitFullscreen = async () => {
  const doc = document as DocumentWithFullscreen;
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen(); // Safari
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen(); // Firefox
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen(); // IE11
    }
  } catch (error) {
    console.error('# Failed to exit fullscreen mode:', error);
  }
};

export default function useFullscreen() {
  // 전체 화면 여부를 묘사하는 변수
  const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenElement());
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!getFullscreenElement());
  }, []);

  // 이벤트 리스너 등록
  useLayoutEffect(() => {
    const EVENTS = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    EVENTS.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      EVENTS.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [handleFullscreenChange]);

  // 토글 함수
  const toggleFullscreen = useCallback(async () => {
    const element = document.documentElement as HTMLElementWithFullscreen;

    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen(element);
    }
  }, [isFullscreen]);

  // 값을 직접 입력하는 함수
  const setFullscreen = useCallback(async (value: boolean) => {
    const element = document.documentElement as HTMLElementWithFullscreen;
    const isCurrentlyFullscreen = !!getFullscreenElement();

    if (value && !isCurrentlyFullscreen) {
      await enterFullscreen(element);
    } else if (!value && isCurrentlyFullscreen) {
      await exitFullscreen();
    }
  }, []);

  return { isFullscreen, toggleFullscreen, setFullscreen };
}
