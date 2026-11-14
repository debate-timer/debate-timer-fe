import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ReactNode, StrictMode } from 'react';
import { ApiUrl } from '../../../apis/endpoints';
import { GetRecordingSessionV2ResponseType } from '../../../apis/responses/recordingV2';
import { server } from '../../../mocks/server';
import { RecordingSessionStatusV2 } from '../../../types/recordingV2';
import { saveHostRecordingV2 } from '../../../util/recordingStorageV2';
import useMultiDeviceTranscriptResult from './useMultiDeviceTranscriptResult';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </StrictMode>
    );
  };
}

const sessionResponse = (
  status: RecordingSessionStatusV2,
  transcriptId: number | null = null,
): GetRecordingSessionV2ResponseType => ({
  sessionKey: 'session-1',
  status,
  transcriptId,
  errorMessage: null,
  turns: [],
});

describe('다기기 녹음 속기록 대기 훅', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('이 탭에서 연 녹음 세션이 없으면 아무것도 하지 않는다', () => {
    const { result } = renderHook(() => useMultiDeviceTranscriptResult(5), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('none');
  });

  it('녹음 세션을 한 번 끝내고 속기록이 만들어지면 속기록 ID를 알려준다', async () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });
    const finish = vi.fn();
    const statuses: RecordingSessionStatusV2[] = ['FINISHING', 'COMPLETED'];
    server.use(
      http.post(`${ApiUrl.recordingV2}/:sessionKey/finish`, ({ params }) => {
        finish(params.sessionKey);
        return new HttpResponse(null, { status: 202 });
      }),
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, () => {
        const status = statuses.shift() ?? 'COMPLETED';
        return HttpResponse.json(
          sessionResponse(status, status === 'COMPLETED' ? 42 : null),
        );
      }),
    );

    const { result } = renderHook(() => useMultiDeviceTranscriptResult(5), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('transcribing');
    await waitFor(() => expect(result.current.status).toBe('ready'), {
      timeout: 5000,
    });
    expect(result.current.transcriptId).toBe(42);
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith('session-1');
  });

  it('속기록을 만들지 못하면 오류로 알린다', async () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });
    server.use(
      http.post(
        `${ApiUrl.recordingV2}/:sessionKey/finish`,
        () => new HttpResponse(null, { status: 202 }),
      ),
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, () =>
        HttpResponse.json(sessionResponse('FAILED')),
      ),
    );

    const { result } = renderHook(() => useMultiDeviceTranscriptResult(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('끝내기 요청이 실패하면 다시 시도할 수 있다', async () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });
    let finishAttempts = 0;
    server.use(
      http.post(`${ApiUrl.recordingV2}/:sessionKey/finish`, () => {
        finishAttempts += 1;
        return finishAttempts === 1
          ? new HttpResponse(null, { status: 500 })
          : new HttpResponse(null, { status: 202 });
      }),
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, () =>
        HttpResponse.json(sessionResponse('COMPLETED', 42)),
      ),
    );
    const { result } = renderHook(() => useMultiDeviceTranscriptResult(5), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.transcriptId).toBe(42);
  });

  it('속기록 ID 없이 끝났다는 응답이 오면 계속 조회하고, 오래 이어지면 오류로 알린다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });
    const poll = vi.fn();
    server.use(
      http.post(
        `${ApiUrl.recordingV2}/:sessionKey/finish`,
        () => new HttpResponse(null, { status: 202 }),
      ),
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, () => {
        poll();
        return HttpResponse.json(sessionResponse('COMPLETED'));
      }),
    );

    try {
      const { result } = renderHook(() => useMultiDeviceTranscriptResult(5), {
        wrapper: createWrapper(),
      });
      await waitFor(() => expect(poll).toHaveBeenCalledTimes(2), {
        timeout: 5000,
      });
      expect(result.current.status).toBe('transcribing');

      await vi.advanceTimersByTimeAsync(40_000);

      await waitFor(() => expect(result.current.status).toBe('error'));
      const polls = poll.mock.calls.length;
      await vi.advanceTimersByTimeAsync(10_000);
      expect(poll).toHaveBeenCalledTimes(polls);
    } finally {
      vi.useRealTimers();
    }
  });

  it('테이블이 바뀌면 그 테이블의 녹음 세션을 끝내고, 이전 세션 결과를 쓰지 않는다', async () => {
    saveHostRecordingV2(5, {
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceToken: 'token',
    });
    saveHostRecordingV2(6, {
      sessionKey: 'session-2',
      joinCode: 'join',
      deviceToken: 'token',
    });
    const finish = vi.fn();
    server.use(
      http.post(`${ApiUrl.recordingV2}/:sessionKey/finish`, ({ params }) => {
        finish(params.sessionKey);
        return new HttpResponse(null, { status: 202 });
      }),
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, ({ params }) =>
        HttpResponse.json(
          params.sessionKey === 'session-1'
            ? sessionResponse('COMPLETED', 41)
            : sessionResponse('FINISHING'),
        ),
      ),
    );

    const { result, rerender } = renderHook(
      ({ tableId }: { tableId: number }) =>
        useMultiDeviceTranscriptResult(tableId),
      { wrapper: createWrapper(), initialProps: { tableId: 5 } },
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ tableId: 6 });

    expect(result.current.status).toBe('transcribing');
    expect(result.current.transcriptId).toBeNull();
    await waitFor(() =>
      expect(finish.mock.calls).toEqual([['session-1'], ['session-2']]),
    );
  });
});
