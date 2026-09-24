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
      latestMessageReceivedAt: null,
      lastReceivedAt: null,
      chairmanAbsentAt: null,
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
      latestMessageReceivedAt: null,
      lastReceivedAt: null,
      chairmanAbsentAt: null,
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
        expect(result.current.displayData.sequence).toBe(1);
        expect(result.current.displayData.eventType).toBe('TEAM_SWITCH');
        expect(result.current.displayData.revision).toBe(1);
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
        expect(result.current.displayData.sequence).toBe(2);
        expect(result.current.displayData.revision).toBe(2);
      }
    }
  });

  it('실행 중 TEAM_SWITCH는 새 팀에서도 실행 상태를 유지한다.', () => {
    let latestMessage: SocketMessage = {
      eventType: 'PLAY',
      data: {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        sequence: 0,
        remainingTime: 30,
      },
    };
    setSocketState({ isConnected: true, latestMessage });

    const { result, rerender } = renderHook(() => useAudienceShareState(1));

    latestMessage = {
      eventType: 'TEAM_SWITCH',
      data: {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        sequence: 0,
        remainingTime: 25,
      },
    };
    setSocketState({ isConnected: true, latestMessage });
    rerender();

    expect(result.current.status).toBe('displaying');
    if (
      result.current.status === 'displaying' &&
      result.current.displayData.timerType === 'TIME_BASED'
    ) {
      expect(result.current.displayData.currentTeam).toBe('CONS');
      expect(result.current.displayData.isRunning).toBe(true);
      expect(result.current.displayData.eventType).toBe('TEAM_SWITCH');
      expect(result.current.displayData.revision).toBe(2);
    }
  });

  it.each([
    { eventType: 'BEFORE' as const, sequence: 2, expectedSequence: 1 },
    { eventType: 'NEXT' as const, sequence: 0, expectedSequence: 1 },
  ])(
    'TIME_BASED $eventType는 실제 이동 대상 sequence를 보존한다.',
    ({ eventType, sequence, expectedSequence }) => {
      setSocketState({
        isConnected: true,
        latestMessage: {
          eventType,
          data: {
            timerType: 'TIME_BASED',
            currentTeam: 'PROS',
            sequence,
            remainingTime: 30,
          },
        },
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      expect(result.current.status).toBe('displaying');
      if (
        result.current.status === 'displaying' &&
        result.current.displayData.timerType === 'TIME_BASED'
      ) {
        expect(result.current.displayData.sequence).toBe(expectedSequence);
        expect(result.current.displayData.eventType).toBe(eventType);
      }
    },
  );

  it('NORMAL에서 TIME_BASED 순서로 이동하면 API 설정으로 시간 기반 표시 상태를 만든다.', () => {
    const mixedTable: TimeBoxInfo[] = [
      normalTable[0],
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        bell: null,
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 120,
        timePerSpeaking: 30,
        speaker: null,
      },
    ];
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'NEXT',
        data: {
          timerType: 'NORMAL',
          sequence: 0,
          remainingTime: 20,
        },
      },
    });

    const { result } = renderHook(() =>
      useAudienceShareState(1, { table: mixedTable }),
    );

    expect(result.current.status).toBe('displaying');
    if (
      result.current.status === 'displaying' &&
      result.current.displayData.timerType === 'TIME_BASED'
    ) {
      expect(result.current.displayData.sequence).toBe(1);
      expect(result.current.displayData.currentTeam).toBe('PROS');
      expect(result.current.displayData.prosTime).toBe(30);
      expect(result.current.displayData.eventType).toBe('NEXT');
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

  it('유효한 토론 이벤트가 600초 동안 없어도 오류로 처리하지 않고 소켓을 유지한다.', () => {
    setSocketState({
      isConnected: true,
      latestMessage: {
        eventType: 'PLAY',
        data: { timerType: 'NORMAL', sequence: 0, remainingTime: 60 },
      },
      lastReceivedAt: Date.now(),
    });

    const { result } = renderHook(() => useAudienceShareState(1));
    expect(result.current.status).toBe('displaying');

    act(() => {
      vi.advanceTimersByTime(600 * 1000);
    });

    expect(result.current.status).toBe('displaying');
    expect(result.current.error).toBeNull();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('소켓 연결 후 첫 이벤트가 600초 동안 없어도 오류로 처리하지 않고 소켓을 유지한다.', () => {
    setSocketState({ isConnected: true, latestMessage: null });

    const { result } = renderHook(() =>
      useAudienceShareState(1, { table: normalTable }),
    );

    act(() => {
      vi.advanceTimersByTime(600 * 1000);
    });

    expect(result.current.status).toBe('displaying');
    expect(result.current.error).toBeNull();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  describe('사회자 연결 상태', () => {
    const syncMessage: SocketMessage = {
      eventType: 'SYNC',
      data: {
        timerType: 'NORMAL',
        sequence: 0,
        remainingTime: 60,
        isRunning: true,
      },
      version: 1,
    };

    it('연결 후 사회자 메시지를 아직 받지 못하면 waiting이다', () => {
      setSocketState({ isConnected: true, latestMessage: null });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );

      act(() => {
        vi.advanceTimersByTime(14999);
      });

      expect(result.current.chairmanPresence).toBe('waiting');
    });

    it('연결 후 15초 동안 사회자 메시지를 한 번도 받지 못하면 absent가 된다', () => {
      setSocketState({ isConnected: true, latestMessage: null });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(result.current.chairmanPresence).toBe('absent');
    });

    it('연결되지 않은 동안에는 첫 메시지 대기 시간을 재지 않는다', () => {
      setSocketState({ isConnected: false, latestMessage: null });

      const { result } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(60 * 1000);
      });

      expect(result.current.chairmanPresence).toBe('waiting');
    });

    it('서버가 사회자 부재를 알리면 바로 absent가 된다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: null,
        chairmanAbsentAt: Date.now(),
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      expect(result.current.chairmanPresence).toBe('absent');
    });

    it('사회자 부재 알림 이후 사회자 메시지를 받으면 present로 바뀐다', () => {
      const absentAt = Date.now();
      setSocketState({
        isConnected: true,
        latestMessage: null,
        chairmanAbsentAt: absentAt,
      });

      const { result, rerender } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
        chairmanAbsentAt: absentAt,
      });
      rerender();

      expect(result.current.chairmanPresence).toBe('present');
    });

    it('사회자 메시지 이후 사회자 부재 알림을 받으면 absent가 된다', () => {
      const receivedAt = Date.now();
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: receivedAt,
      });

      const { result, rerender } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: receivedAt,
        chairmanAbsentAt: Date.now(),
      });
      rerender();

      expect(result.current.chairmanPresence).toBe('absent');
    });

    it('사회자 메시지를 받으면 present이다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      expect(result.current.chairmanPresence).toBe('present');
    });

    it('마지막 수신 후 15초 동안 메시지가 없으면 absent가 된다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(14999);
      });
      expect(result.current.chairmanPresence).toBe('present');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.chairmanPresence).toBe('absent');
    });

    it('수신이 이어지면 판정 시간이 다시 시작된다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });

      const { result, rerender } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });
      rerender();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.chairmanPresence).toBe('present');
    });

    it('absent 상태에서 다시 메시지를 받으면 present로 복구된다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });

      const { result, rerender } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(result.current.chairmanPresence).toBe('absent');

      setSocketState({
        isConnected: true,
        latestMessage: { ...syncMessage, version: 2 },
        lastReceivedAt: Date.now(),
      });
      rerender();

      expect(result.current.chairmanPresence).toBe('present');
    });

    it('재연결로 수신 기록이 초기화되면 waiting으로 돌아간다', () => {
      setSocketState({
        isConnected: true,
        latestMessage: syncMessage,
        lastReceivedAt: Date.now(),
      });

      const { result, rerender } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(result.current.chairmanPresence).toBe('absent');

      setSocketState({
        isConnected: true,
        latestMessage: null,
        lastReceivedAt: null,
      });
      rerender();

      expect(result.current.chairmanPresence).toBe('waiting');
    });
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

  describe('네트워크 지연 보정 기준 시각(syncedAt)', () => {
    const RECEIVED_AT = 1_790_000_000_000;
    const playMessage = (serverTime?: number | null): SocketMessage => ({
      eventType: 'PLAY',
      data: { timerType: 'NORMAL', sequence: 0, remainingTime: 75 },
      version: 1,
      serverTime,
    });

    it('수신 시각에서 서버 중계 이후 흐른 시간을 뺀 시각을 syncedAt으로 노출한다', () => {
      setSocketState({
        latestMessage: playMessage(RECEIVED_AT - 200),
        latestMessageReceivedAt: RECEIVED_AT,
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.syncedAt).toBe(RECEIVED_AT - 200);
      }
    });

    it('서버 중계 시각이 없으면 수신 시각을 syncedAt으로 노출한다', () => {
      setSocketState({
        latestMessage: playMessage(null),
        latestMessageReceivedAt: RECEIVED_AT,
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      if (result.current.status === 'displaying') {
        expect(result.current.syncedAt).toBe(RECEIVED_AT);
      }
    });

    it('기기 시계가 어긋나 지연이 비정상이면 수신 시각을 syncedAt으로 노출한다', () => {
      setSocketState({
        latestMessage: playMessage(RECEIVED_AT + 5000),
        latestMessageReceivedAt: RECEIVED_AT,
      });

      const { result } = renderHook(() => useAudienceShareState(1));

      if (result.current.status === 'displaying') {
        expect(result.current.syncedAt).toBe(RECEIVED_AT);
      }
    });

    it('메시지 없이 표시한 초기 화면은 syncedAt이 null이다', () => {
      setSocketState({ latestMessage: null });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.syncedAt).toBeNull();
      }
    });
  });

  describe('첫 메시지 대기 중 초기 화면', () => {
    it('연결 후 1초 동안 메시지가 없으면 첫 순서 타이머를 정지 상태로 표시한다', () => {
      setSocketState({ isConnected: true, latestMessage: null });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );
      expect(result.current.status).toBe('waiting');

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.displayData).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 180,
          sequence: 0,
        });
      }
    });

    it('첫 순서가 자유토론이면 자유토론 타이머를 정지 상태로 표시한다', () => {
      const timeBasedTable: TimeBoxInfo[] = [
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          bell: null,
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 90,
          timePerSpeaking: 30,
          speaker: null,
        },
      ];
      setSocketState({ isConnected: true, latestMessage: null });

      const { result } = renderHook(() =>
        useAudienceShareState(1, { table: timeBasedTable }),
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.displayData).toMatchObject({
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: false,
          sequence: 0,
        });
      }
    });

    it('1초 안에 메시지를 받으면 초기 화면으로 덮어쓰지 않는다', () => {
      setSocketState({ isConnected: true, latestMessage: null });
      const { result, rerender } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );

      setSocketState({
        isConnected: true,
        latestMessage: {
          eventType: 'SYNC',
          data: {
            timerType: 'NORMAL',
            sequence: 1,
            remainingTime: 42,
            isRunning: true,
          },
        },
      });
      rerender();
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.displayData).toMatchObject({
          sequence: 1,
          singleTime: 42,
          isRunning: true,
        });
      }
    });

    it('초기 화면 표시 후 SYNC를 받으면 받은 상태로 바뀐다', () => {
      setSocketState({ isConnected: true, latestMessage: null });
      const { result, rerender } = renderHook(() =>
        useAudienceShareState(1, { table: normalTable }),
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      setSocketState({
        isConnected: true,
        latestMessage: {
          eventType: 'SYNC',
          data: {
            timerType: 'NORMAL',
            sequence: 1,
            remainingTime: 42,
            isRunning: true,
          },
        },
      });
      rerender();

      expect(result.current.status).toBe('displaying');
      if (result.current.status === 'displaying') {
        expect(result.current.displayData).toMatchObject({
          sequence: 1,
          singleTime: 42,
          isRunning: true,
        });
      }
    });

    it('테이블 정보가 없으면 대기 상태를 유지한다', () => {
      setSocketState({ isConnected: true, latestMessage: null });
      const { result } = renderHook(() => useAudienceShareState(1));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.status).toBe('waiting');
    });
  });
});
