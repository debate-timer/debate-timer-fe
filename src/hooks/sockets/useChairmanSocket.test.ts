import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimerDataPayload } from '../../apis/sockets/type';
import useChairmanSocket from './useChairmanSocket';

const useSocketMock = vi.hoisted(() => vi.fn());

vi.mock('./useSocket', () => ({
  default: useSocketMock,
}));

describe('useChairmanSocket', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();
  const publish = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('마운트 시 roomId 기반 사회자 채널을 구독해야 한다', () => {
    renderHook(() => useChairmanSocket(123));

    expect(subscribe).toHaveBeenCalledWith(
      '/chairman/123',
      expect.any(Function),
    );
  });

  it('신호를 수신하면 signalCount와 lastSignalTime을 업데이트해야 한다', () => {
    const now = 1710000000000;
    let handleMessage: (message: IMessage) => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    expect(result.current.signalCount).toBe(1);
    expect(result.current.lastSignalTime).toBe(now);
  });

  it('sendDebateEvent 호출 시 payload와 Authorization 헤더를 함께 publish해야 한다', () => {
    const payload: TimerDataPayload = {
      timerType: 'NORMAL',
      currentTeam: 'PROS',
      remainingTime: 30,
      sequence: 1,
    };
    const authToken = 'temporary-chairman-token';

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.sendDebateEvent('NEXT', payload, authToken);
    });

    expect(publish).toHaveBeenCalledWith(
      '/app/event/123',
      {
        eventType: 'NEXT',
        data: payload,
      },
      { Authorization: authToken },
    );
  });

  it('error가 발생하면 Toast 대체 console 알림을 호출해야 한다', () => {
    const error = new Error('socket failure');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      error,
    });

    renderHook(() => useChairmanSocket(123));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Chairman socket connection failed.',
      error,
    );
  });
});
