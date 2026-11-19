import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode, StrictMode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { ApiUrl } from '../../../apis/endpoints';
import {
  appendSegmentUtterances,
  appendUtterance,
  markSegmentPending,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  setSubmittedTranscriptId,
  startTranscriptDraft,
} from '../../../util/transcriptDraft';
import useTranscriptDraftSubmitter from '../../../hooks/useTranscriptDraftSubmitter';
import useSubmitTranscript from './useSubmitTranscript';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <StrictMode>{children}</StrictMode>;
  };
}

// 앱 루트의 제출기와 종료 화면을 함께 띄운 상태. 자동 재시도 없이 바로 실패를 표시한다.
function useEndPageTranscript(tableId: number) {
  useTranscriptDraftSubmitter({ retryDelaysMs: NO_RETRY });
  return useSubmitTranscript(tableId);
}
const NO_RETRY: number[] = [];

function prepareDraft() {
  startTranscriptDraft(5, 1000);
  appendUtterance(
    5,
    { id: 's1', timeBoxIndex: 0, team: null },
    '찬성 입론',
    2000,
  );
}

describe('토론 기록 초안 전송 훅', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('기록한 발언이 없으면 아무것도 보내지 않는다', () => {
    const { result } = renderHook(() => useEndPageTranscript(5), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('none');
  });

  it('기록 초안이 있으면 한 번만 보내고 받은 기록 ID를 보관한다', async () => {
    prepareDraft();
    const handler = vi.fn();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, async ({ request }) => {
        handler(await request.json());
        return HttpResponse.json({ id: 31 }, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useEndPageTranscript(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.transcriptId).toBe(31);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      segments: [
        {
          timeBoxIndex: 0,
          team: null,
          utterances: [{ offsetMs: 1000, text: '찬성 입론' }],
        },
      ],
      sttMode: 'RPC',
    });
    expect(getSubmittedTranscriptId(5)).toBe(31);
    expect(getTranscriptDraft(5)).toBeNull();
  });

  it('다른 테이블로 이동해도 응답을 시작한 테이블에 보관하고 새 기록을 따로 제출한다', async () => {
    prepareDraft();
    startTranscriptDraft(6, 1000);
    appendUtterance(
      6,
      { id: 'new', timeBoxIndex: 0, team: null },
      '새 토론',
      2000,
    );
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const received = vi.fn();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, async ({ params }) => {
        received(params.tableId);
        if (params.tableId === '5') {
          await pending;
        }
        return HttpResponse.json(
          { id: params.tableId === '5' ? 99 : 66 },
          { status: 201 },
        );
      }),
    );
    const { result, rerender } = renderHook(
      ({ tableId }) => useEndPageTranscript(tableId),
      { initialProps: { tableId: 5 }, wrapper: createWrapper() },
    );
    await waitFor(() => expect(received).toHaveBeenCalledWith('5'));
    rerender({ tableId: 6 });
    act(() => release());
    await waitFor(() => expect(result.current.transcriptId).toBe(66));
    expect(getSubmittedTranscriptId(5)).toBe(99);
    expect(getSubmittedTranscriptId(6)).toBe(66);
  });

  it('이미 보낸 기록이 있으면 다시 보내지 않고 그 ID를 쓴다', () => {
    setSubmittedTranscriptId(5, 12);

    const { result } = renderHook(() => useEndPageTranscript(5), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.transcriptId).toBe(12);
  });

  it('제출 도중 새 초안이 시작되면 이전 응답으로 새 초안을 삭제하지 않는다', async () => {
    prepareDraft();
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const received = vi.fn();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, async () => {
        received();
        await pending;
        return HttpResponse.json({ id: 99 }, { status: 201 });
      }),
    );
    renderHook(() => useEndPageTranscript(5), { wrapper: createWrapper() });
    await waitFor(() => expect(received).toHaveBeenCalled());
    startTranscriptDraft(5, 9000);
    await act(async () => {
      release();
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(getTranscriptDraft(5)?.startedAt).toBe(9000);
    expect(getSubmittedTranscriptId(5)).toBeNull();
  });

  it('보내기에 실패하면 초안을 남기고 다시 시도할 수 있다', async () => {
    prepareDraft();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useEndPageTranscript(5), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(getTranscriptDraft(5)).not.toBeNull();

    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () =>
        HttpResponse.json({ id: 40 }, { status: 201 }),
      ),
    );
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.transcriptId).toBe(40);
  });

  it('종료 화면을 떠나도 전사가 끝나면 앱의 제출기가 기록을 보낸다', async () => {
    const context = startTranscriptDraft(5, 1000, 'SONIOX');
    markSegmentPending(context, 'p1', Date.now());
    const handler = vi.fn();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, async ({ request }) => {
        handler(await request.json());
        return HttpResponse.json({ id: 88 }, { status: 201 });
      }),
    );
    renderHook(() => useTranscriptDraftSubmitter({ retryDelaysMs: NO_RETRY }), {
      wrapper: createWrapper(),
    });
    const endPage = renderHook(() => useSubmitTranscript(5), {
      wrapper: createWrapper(),
    });
    expect(endPage.result.current.status).toBe('transcribing');

    endPage.unmount();
    act(() =>
      appendSegmentUtterances(
        context,
        { id: 'p1', timeBoxIndex: 0, team: null },
        2000,
        [{ offsetMs: 0, text: '마지막 발언' }],
      ),
    );

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(88));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(getTranscriptDraft(5)).toBeNull();
  });

  describe('Soniox 모드', () => {
    const SEGMENT = { id: 'p1', timeBoxIndex: 0, team: null };

    it('전사 중인 구간이 끝날 때까지 기다린 뒤 Soniox 모드로 보낸다', async () => {
      startTranscriptDraft(5, 1000, 'SONIOX');
      markSegmentPending(5, 'p1', Date.now());
      const handler = vi.fn();
      server.use(
        http.post(`${ApiUrl.transcript}/:tableId`, async ({ request }) => {
          handler(await request.json());
          return HttpResponse.json({ id: 77 }, { status: 201 });
        }),
      );

      const { result } = renderHook(() => useEndPageTranscript(5), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe('transcribing');
      expect(result.current.pendingCount).toBe(1);
      expect(handler).not.toHaveBeenCalled();

      appendSegmentUtterances(5, SEGMENT, 2000, [
        { offsetMs: 0, text: '찬성 입론' },
      ]);

      await waitFor(() => expect(result.current.status).toBe('ready'), {
        timeout: 3000,
      });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        segments: [
          {
            timeBoxIndex: 0,
            team: null,
            utterances: [{ offsetMs: 1000, text: '찬성 입론' }],
          },
        ],
        sttMode: 'SONIOX',
      });
    });

    it('전사가 끝났는데 남은 발언이 없으면 보내지 않는다', async () => {
      startTranscriptDraft(5, 1000, 'SONIOX');
      markSegmentPending(5, 'p1', Date.now());
      const handler = vi.fn();
      server.use(
        http.post(`${ApiUrl.transcript}/:tableId`, () => {
          handler();
          return HttpResponse.json({ id: 77 }, { status: 201 });
        }),
      );

      const { result } = renderHook(() => useEndPageTranscript(5), {
        wrapper: createWrapper(),
      });
      appendSegmentUtterances(5, SEGMENT, 2000, []);

      await waitFor(() => expect(result.current.status).toBe('none'), {
        timeout: 3000,
      });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
