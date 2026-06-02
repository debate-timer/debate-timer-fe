import { useEffect } from 'react';
import { TimerPageLogics } from './useTimerPageState';
import { SocketEventType } from '../../../apis/sockets/type';

/**
 * 타이머 페이지에서 키보드 단축키(핫키) 기능을 제공하는 커스텀 훅입니다.
 * - Space: 타이머 시작/일시정지
 * - KeyR: 타이머 리셋
 * - KeyA/KeyL: 각각 찬/반 진영 타이머 활성화
 * - Enter, NumpadEnter: 진영 전환
 */
export function useTimerHotkey(
  state: TimerPageLogics,
  onEvent: (invoke: () => void, eventType: SocketEventType) => void,
) {
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
    // 데이터가 아직 로딩 중이면 핫키 적용하지 않음
    if (!data) return;
    const boxType = data.table[index].boxType;

    /**
     * 키보드 이벤트 리스너 (핫키 처리)
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // 핫키로 쓸 키 목록
      const keysToDisable = new Set([
        'Space',
        'KeyR',
        'KeyA',
        'KeyL',
        'Enter',
        'NumpadEnter',
      ]);

      // 핫키 입력시, 기본 동작(스크롤, 폼 전송 등) 막음
      if (keysToDisable.has(event.code)) {
        event.preventDefault();
      }
      // 입력 포커스 해제(특히 input/select 사용 중일 때)
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      // 찬/반 타이머 토글 (시작/정지)
      const toggleTimer = (timer: typeof timer1 | typeof timer2) => {
        if (timer.isRunning) {
          onEvent(timer.pauseTimer, 'STOP');
        } else {
          onEvent(timer.startTimer, 'PLAY');
        }
      };

      switch (event.code) {
        case 'Space':
          // 일반 타이머/진영별 타이머 동작 제어
          if (boxType === 'NORMAL') {
            if (normalTimer.isRunning) {
              onEvent(normalTimer.pauseTimer, 'STOP');
            } else {
              onEvent(normalTimer.startTimer, 'PLAY');
            }
          } else {
            if (prosConsSelected === 'PROS') {
              toggleTimer(timer1);
            } else if (prosConsSelected === 'CONS') {
              toggleTimer(timer2);
            }
          }
          break;
        case 'KeyR':
          // 타이머 리셋
          if (boxType === 'NORMAL') {
            onEvent(normalTimer.resetTimer, 'RESET');
          } else {
            if (prosConsSelected === 'PROS') {
              onEvent(() => timer1.resetCurrentTimer(timer2.isDone), 'RESET');
            } else {
              onEvent(() => timer2.resetCurrentTimer(timer1.isDone), 'RESET');
            }
          }
          break;
        case 'KeyA':
          // 찬성 진영 선택 및 반대 타이머 정지
          if (prosConsSelected === 'CONS') {
            const handleSwitching = () => {
              if (timer1.isDone) {
                setProsConsSelected('PROS');
              } else {
                switchCamp();
              }
            };

            onEvent(handleSwitching, 'TEAM_SWITCH');
          }
          break;
        case 'KeyL':
          // 반대 진영 선택 및 찬성 타이머 정지
          if (prosConsSelected === 'PROS') {
            const handleSwitching = () => {
              if (timer1.isDone) {
                setProsConsSelected('CONS');
              } else {
                switchCamp();
              }
            };

            onEvent(handleSwitching, 'TEAM_SWITCH');
          }
          break;
        case 'Enter':
        case 'NumpadEnter':
          // 진영 전환
          onEvent(switchCamp, 'TEAM_SWITCH');
          break;
      }
    };

    // 전역 단축키 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    // 언마운트 시 리스너 해제
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
    onEvent,
  ]);
}
