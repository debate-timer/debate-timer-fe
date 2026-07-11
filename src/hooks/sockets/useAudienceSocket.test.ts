import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  MockInstance,
} from 'vitest';
import type { SocketMessage } from '../../apis/sockets/type';
import useAudienceSocket from './useAudienceSocket';

const useSocketMock = vi.hoisted(() => vi.fn());

vi.mock('./useSocket', () => ({
  default: useSocketMock,
}));

describe('useAudienceSocket', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();
  const addConnectionListener = vi.fn();

  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    addConnectionListener.mockImplementation(() => vi.fn());
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      addConnectionListener,
      isConnected: true,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('마운트 시 roomId 기반 채널을 구독해야 한다', () => {
    renderHook(() => useAudienceSocket(123));

    expect(subscribe).toHaveBeenCalledWith('/room/123', expect.any(Function));
  });

  it('유효한 메시지를 수신하면 latestMessage 상태를 업데이트해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    expect(result.current.latestMessage).toEqual(message);
  });

  it('유효한 메시지를 여러 번 수신하면 가장 최근 메시지만 노출해야 한다', () => {
    const message1: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const message2: SocketMessage = {
      eventType: 'ERROR',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message1) } as IMessage);
    });

    expect(result.current.latestMessage).toEqual(message1);

    act(() => {
      handleMessage({ body: JSON.stringify(message2) } as IMessage);
    });

    expect(result.current.latestMessage).toEqual(message2);
  });

  it('잘못된 JSON을 수신하면 console.log를 호출하고 마지막 정상 메시지를 유지해야 한다', () => {
    const validMessage: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(validMessage) } as IMessage);
    });

    act(() => {
      handleMessage({ body: '{ invalid_json }' } as IMessage);
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '메시지 파싱 오류:',
      expect.any(Error),
    );
    expect(result.current.latestMessage).toEqual(validMessage);
  });

  it('계약 불일치 메시지(타입 가드 실패)를 수신하면 console.log를 호출하고 마지막 정상 메시지를 유지해야 한다', () => {
    const validMessage: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const invalidMessage = {
      eventType: 'UNKNOWN_EVENT',
      data: { some: 'data' },
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(validMessage) } as IMessage);
    });

    act(() => {
      handleMessage({ body: JSON.stringify(invalidMessage) } as IMessage);
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '잘못된 소켓 메시지 형식입니다:',
      invalidMessage,
    );
    expect(result.current.latestMessage).toEqual(validMessage);
  });

  it('connect 호출 전에 기존 latestMessage 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const options = { baseUrl: 'https://api.example.com' };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      result.current.connect(options);
    });

    expect(result.current.latestMessage).toBeNull();
    expect(connect).toHaveBeenCalledWith(options);
  });

  it('disconnect 호출 시 latestMessage 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.latestMessage).toBeNull();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('roomId가 변경되면 기존 latestMessage 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const callbacks = new Map<string, (message: IMessage) => void>();
    subscribe.mockImplementation(
      (destination: string, callback: (message: IMessage) => void) => {
        callbacks.set(destination, callback);
      },
    );

    const { result, rerender } = renderHook(
      ({ roomId }) => useAudienceSocket(roomId),
      { initialProps: { roomId: 123 } },
    );

    act(() => {
      callbacks.get('/room/123')?.({
        body: JSON.stringify(message),
      } as IMessage);
    });

    act(() => {
      rerender({ roomId: 456 });
    });

    expect(result.current.latestMessage).toBeNull();
    expect(unsubscribe).toHaveBeenCalledWith('/room/123');
    expect(subscribe).toHaveBeenCalledWith('/room/456', expect.any(Function));
  });

  it('소켓 재연결 이벤트가 발생하면 latestMessage 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    let handleConnection: () => void = () => undefined;
    addConnectionListener.mockImplementation((listener: () => void) => {
      handleConnection = listener;
      return vi.fn();
    });
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      handleConnection();
    });

    expect(result.current.latestMessage).toBeNull();
  });

  it('에러가 발생해도 기존 부수 효과 없이 error 객체 자체와 isConnected 상태를 그대로 노출해야 한다', () => {
    const error = new Error('socket failure');
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      addConnectionListener,
      isConnected: false,
      error,
    });

    const { result } = renderHook(() => useAudienceSocket(123));

    expect(result.current.error).toBe(error);
    expect(result.current.isConnected).toBe(false);
  });
});
