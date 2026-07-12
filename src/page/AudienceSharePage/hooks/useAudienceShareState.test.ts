import { renderHook, act } from '@testing-library/react';
import { useAudienceShareState } from './useAudienceShareState';
import { useAudienceCountdown } from './useAudienceCountdown';
import * as useAudienceSocketModule from '../../../hooks/sockets/useAudienceSocket';
import { SocketMessage } from '../../../apis/sockets/type';
import { SocketError } from '../../../apis/sockets/error';
import { TimeBoxInfo } from '../../../type/type';

vi.mock('../../../hooks/sockets/useAudienceSocket');

describe('useAudienceShareState', () => {
  let mockConnect: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  const normalTable: TimeBoxInfo[] = [
    {
      stance: 'PROS',
      speechType: '입론',
      bell: null,
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
    {
      stance: 'CONS',
      speechType: '반론',
      bell: null,
      boxType: 'NORMAL',
      time: 90,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    mockConnect = vi.fn();
    mockDisconnect = vi.fn();

    vi.spyOn(useAudienceSocketModule, 'default').mockReturnValue({
      connect: mockConnect as unknown as (options?: unknown) => void,
      disconnect: mockDisconnect as unknown as () => void,
      latestMessage: null,
      isConnected: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const setSocketState = (
    state: Partial<ReturnType<typeof useAudienceSocketModule.default>>,
  ) => {
    vi.spyOn(useAudienceSocketModule, 'default').mockReturnValue({
      connect: mockConnect as unknown as (options?: unknown) => void,
      disconnect: mockDisconnect as unknown as () => void,
      latestMessage: null,
      isConnected: true,
      error: null,
      ...state,
    });
  };

  it('훅 마운트와 언마운트가 소켓 connect/disconnect 수명 주기를 각각 한 번 수행한다.', () => {
    const { unmount } = renderHook(() => useAudienceShareState(1));
    expect(mockConnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('연결이 비활성화되면 소켓에 연결하거나 연결 해제를 시도하지 않는다.', () => {
    const { result, unmount } = renderHook(() =>
      useAudienceShareState(1, { enabled: false }),
    );

    expect(result.current.status).toBe('connecting');
    expect(mockConnect).not.toHaveBeenCalled();

    unmount();

    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('연결이 활성화되는 시점에 소켓 연결을 한 번 시작하고 언마운트 시 정리한다.', () => {
    const { rerender, unmount } = renderHook(
      ({ enabled }) => useAudienceShareState(1, { enabled }),
      { initialProps: { enabled: false } },
    );

    expect(mockConnect).not.toHaveBeenCalled();

    rerender({ enabled: true });

    expect(mockConnect).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('연결 전에는 connecting, 연결 후 데이터 대기, 데이터 표시, 종료 상태가 입력에 따라 명확히 구분된다.', () => {
    // 연결 전 connecting
    const { result, rerender } = renderHook(() => useAudienceShareState(1));
    expect(result.current.status).toBe('connecting');

    // 연결 후 첫 메시지 전에는 waiting
    setSocketState({ isConnected: true, latestMessage: null });
    rerender();
    expect(result.current.status).toBe('waiting');

    // 데이터 수신 시 displaying
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: { timerType: 'NORMAL', sequence: 0, remainingTime: 100 },
      },
    });
    rerender();
    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('NORMAL');
    }

    // 종료 메시지 시 finished
    setSocketState({
      isConnected: true,
      latestMessage: { eventType: 'FINISHED', data: null },
    });
    rerender();
    expect(result.current.status).toBe('finished');
  });

  it('일반 타이머 이벤트는 단일 표시 시간을 서버 수신값으로 동기화한다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'STOP',
        data: { timerType: 'NORMAL', sequence: 1, remainingTime: 60 },
      },
    });
    const { result } = renderHook(() => useAudienceShareState(1));

    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('NORMAL');
      if (result.current.displayData.timerType === 'NORMAL') {
        expect(result.current.displayData.singleTime).toBe(60);
        expect(result.current.displayData.sequence).toBe(1);
      }
    }
  });

  it.each([
    { eventType: 'PLAY' as const, isRunning: true },
    { eventType: 'STOP' as const, isRunning: false },
  ])('$eventType 이벤트를 독립적으로 처리한다', ({ eventType, isRunning }) => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType,
        data: { timerType: 'NORMAL', sequence: 0, remainingTime: 75 },
      },
    });

    const { result } = renderHook(() => useAudienceShareState(1));

    expect(result.current.status).toBe('displaying');
    if (
      result.current.status === 'displaying' &&
      result.current.displayData.timerType === 'NORMAL'
    ) {
      expect(result.current.displayData.isRunning).toBe(isRunning);
      expect(result.current.displayData.singleTime).toBe(75);
      expect(result.current.displayData.sequence).toBe(0);
    }
  });

  it('RESET 이벤트는 현재 순서의 전체 시간으로 되돌린다', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'RESET',
        data: { timerType: 'NORMAL', sequence: 1, remainingTime: 12 },
      },
    });

    const { result } = renderHook(() =>
      useAudienceShareState(1, { table: normalTable }),
    );

    expect(result.current.status).toBe('displaying');
    if (
      result.current.status === 'displaying' &&
      result.current.displayData.timerType === 'NORMAL'
    ) {
      expect(result.current.displayData.isRunning).toBe(false);
      expect(result.current.displayData.sequence).toBe(1);
      expect(result.current.displayData.singleTime).toBe(90);
    }
  });

  it.each([
    {
      eventType: 'BEFORE' as const,
      receivedSequence: 1,
      expectedSequence: 0,
      expectedTime: 180,
    },
    {
      eventType: 'NEXT' as const,
      receivedSequence: 0,
      expectedSequence: 1,
      expectedTime: 90,
    },
  ])(
    '$eventType 이벤트는 sequence를 이동하고 목표 순서의 전체 시간을 표시한다',
    ({ eventType, receivedSequence, expectedSequence, expectedTime }) => {
      setSocketState({
        isConnected: true,
        latestMessage: {
          eventType,
          data: {
            timerType: 'NORMAL',
            sequence: receivedSequence,
            remainingTime: 12,
          },
        },
      });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );

      expect(result.current.status).toBe('displaying');
      if (
        result.current.status === 'displaying' &&
        result.current.displayData.timerType === 'NORMAL'
      ) {
        expect(result.current.displayData.isRunning).toBe(false);
        expect(result.current.displayData.sequence).toBe(expectedSequence);
        expect(result.current.displayData.singleTime).toBe(expectedTime);
      }
    },
  );

  it('시간 기반 이벤트는 현재 팀 시간만 갱신하고 상대 팀의 마지막 수신 시간 또는 null을 유지한다.', () => {
    const { result, rerender } = renderHook(() => useAudienceShareState(1));

    // 최초 메시지: 찬성 팀
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          sequence: 0,
          remainingTime: 120,
        },
      },
    });
    rerender();
    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('TIME_BASED');
      if (result.current.displayData.timerType === 'TIME_BASED') {
        expect(result.current.displayData.currentTeam).toBe('PROS');
        expect(result.current.displayData.prosTime).toBe(120);
        expect(result.current.displayData.consTime).toBeNull(); // 최초 TIME_BASED에서 비활성 팀 null 유지
      }
    }

    // 다음 메시지: 반대 팀으로 전환
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: {
          timerType: 'TIME_BASED',
          currentTeam: 'CONS',
          sequence: 1,
          remainingTime: 90,
        },
      },
    });
    rerender();
    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('TIME_BASED');
      if (result.current.displayData.timerType === 'TIME_BASED') {
        expect(result.current.displayData.currentTeam).toBe('CONS');
        expect(result.current.displayData.prosTime).toBe(120); // 찬성 시간 유지
        expect(result.current.displayData.consTime).toBe(90);
      }
    }
  });

  it('TEAM_SWITCH는 수신 팀의 시간을 갱신하고 표시 팀은 반대 진영으로 전환한다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'TEAM_SWITCH',
        data: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          sequence: 1,
          remainingTime: 77,
        },
      },
    });
    const { result, rerender } = renderHook(() => useAudienceShareState(1));

    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('TIME_BASED');
      if (result.current.displayData.timerType === 'TIME_BASED') {
        expect(result.current.displayData.currentTeam).toBe('CONS');
        expect(result.current.displayData.prosTime).toBe(77);
        expect(result.current.displayData.consTime).toBeNull();
        expect(result.current.displayData.isRunning).toBe(false);
      }
    }

    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'TEAM_SWITCH',
        data: {
          timerType: 'TIME_BASED',
          currentTeam: 'CONS',
          sequence: 2,
          remainingTime: 55,
        },
      },
    });
    rerender();

    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('TIME_BASED');
      if (result.current.displayData.timerType === 'TIME_BASED') {
        expect(result.current.displayData.currentTeam).toBe('PROS');
        expect(result.current.displayData.prosTime).toBe(77);
        expect(result.current.displayData.consTime).toBe(55);
        expect(result.current.displayData.isRunning).toBe(false);
      }
    }
  });

  it('시간 기반 이벤트에 현재 팀이 없으면 표시 상태를 만들지 않는다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: {
          timerType: 'TIME_BASED',
          sequence: 0,
          remainingTime: 120,
        },
      },
    });

    const { result } = renderHook(() => useAudienceShareState(1));

    expect(result.current.status).toBe('waiting');
  });

  it('NORMAL 이벤트의 sequence를 표시 상태에 보존한다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: { timerType: 'NORMAL', sequence: 5, remainingTime: 60 },
      },
    });
    const { result } = renderHook(() => useAudienceShareState(1));

    expect(result.current.status).toBe('displaying');
    if (result.current.status === 'displaying') {
      expect(result.current.displayData.timerType).toBe('NORMAL');
      if (result.current.displayData.timerType === 'NORMAL') {
        expect(result.current.displayData.sequence).toBe(5);
      }
    }
  });

  it('PLAY는 로컬 감소를 시작하고 STOP은 수신값에서 감소를 멈추며 새 이벤트는 표시값을 재동기화한다.', () => {
    // 이 부분은 useAudienceCountdown과 연동하여 테스트합니다. (Review notes 요구사항 포함)
    let latestMessage: SocketMessage = {
      eventType: 'PLAY',
      data: {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        sequence: 0,
        remainingTime: 10,
      },
    };

    setSocketState({ isConnected: true, latestMessage });

    const { result, rerender } = renderHook(() => {
      const state = useAudienceShareState(1);
      const isProsRunning =
        state.status === 'displaying' &&
        state.displayData.isRunning &&
        state.displayData.currentTeam === 'PROS';
      const isConsRunning =
        state.status === 'displaying' &&
        state.displayData.isRunning &&
        state.displayData.currentTeam === 'CONS';

      const prosTime =
        state.status === 'displaying' &&
        state.displayData.timerType === 'TIME_BASED'
          ? state.displayData.prosTime
          : null;
      const consTime =
        state.status === 'displaying' &&
        state.displayData.timerType === 'TIME_BASED'
          ? state.displayData.consTime
          : null;

      const prosCountdown = useAudienceCountdown({
        receivedTime: prosTime,
        isRunning: isProsRunning,
      });
      const consCountdown = useAudienceCountdown({
        receivedTime: consTime,
        isRunning: isConsRunning,
      });

      return { state, prosCountdown, consCountdown };
    });

    expect(result.current.prosCountdown.currentSeconds).toBe(10);
    expect(result.current.consCountdown.currentSeconds).toBeNull();

    // 시간이 흐름
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // PROS 시간 감소, CONS는 그대로 null
    expect(result.current.prosCountdown.currentSeconds).toBe(8);
    expect(result.current.consCountdown.currentSeconds).toBeNull();

    // STOP 이벤트 수신
    latestMessage = {
      eventType: 'STOP',
      data: {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        sequence: 0,
        remainingTime: 8,
      }, // 8초 수신
    };
    setSocketState({ isConnected: true, latestMessage });
    rerender();

    // STOP 수신 시 동기화
    expect(result.current.prosCountdown.currentSeconds).toBe(8);

    // 시간 흐름 - 감소하지 않음
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.prosCountdown.currentSeconds).toBe(8);
  });

  it('유효한 토론 이벤트가 600초 동안 없으면 오류 상태가 생성되고 소켓 및 시간 자원이 정리된다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: { timerType: 'NORMAL', sequence: 0, remainingTime: 60 },
      },
    });

    const { result, rerender } = renderHook(() => useAudienceShareState(1));
    expect(result.current.status).toBe('displaying');

    act(() => {
      vi.advanceTimersByTime(600 * 1000);
    });
    rerender();

    expect(result.current.status).toBe('displaying'); // wait, the error is set but what is the status?
    // Wait, earlier I set it to just keep status as is and append error? Or does it change status to 'displaying' but with error?
    // "오류 상태가 생성되고" -> error 필드가 갱신됨.
    expect(result.current.error?.code).toBe('EVENT_TIMEOUT');
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('소켓 연결 후 첫 이벤트가 600초 동안 없으면 EVENT_TIMEOUT 오류가 생성되고 소켓이 정리된다.', () => {
    setSocketState({ isConnected: true, latestMessage: null });

    const { result, rerender } = renderHook(() => useAudienceShareState(1));
    expect(result.current.status).toBe('waiting');

    act(() => {
      vi.advanceTimersByTime(600 * 1000);
    });
    rerender();

    expect(result.current.status).toBe('waiting');
    expect(result.current.error?.code).toBe('EVENT_TIMEOUT');
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('ERROR 메시지와 소켓 오류 처리', () => {
    // 서버 ERROR 메시지
    setSocketState({
      isConnected: true,
      latestMessage: { eventType: 'ERROR', data: null },
    });
    const { result: res1 } = renderHook(() => useAudienceShareState(1));
    expect(res1.current.error?.code).toBe('SERVER_ERROR');
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockDisconnect.mockClear();

    // SocketError
    setSocketState({
      isConnected: true,
      error: new SocketError('SOCKET_STOMP_ERROR', 'Stomp failed'),
    });
    const { result: res2 } = renderHook(() => useAudienceShareState(2));
    expect(res2.current.error?.code).toBe('SOCKET_STOMP_ERROR');
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockDisconnect.mockClear();

    // 미분류 오류
    setSocketState({
      isConnected: true,
      error: new Error('Network Down'),
    });
    const { result: res3 } = renderHook(() => useAudienceShareState(3));
    expect(res3.current.error?.code).toBe('UNKNOWN');
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('재연결 세션에서는 이전 최신 메시지와 표시 화면이 첫 데이터로 재사용되지 않는다.', () => {
    const { result, rerender } = renderHook(() => useAudienceShareState(1));

    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: { timerType: 'NORMAL', sequence: 0, remainingTime: 60 },
      },
    });
    rerender();
    expect(result.current.status).toBe('displaying');

    // 끊김 후 재연결, 메시지 null
    setSocketState({
      isConnected: true,
      latestMessage: null,
    });
    rerender();
    expect(result.current.status).toBe('waiting');
  });
});
