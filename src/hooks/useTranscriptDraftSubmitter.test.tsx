import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode, StrictMode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import {
  appendSegmentUtterances,
  appendUtterance,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  listEndedTranscriptDrafts,
  markSegmentPending,
  markTranscriptDraftEnded,
  retryTranscriptSubmit,
  startTranscriptDraft,
} from '../util/transcriptDraft';
import useTranscriptDraftSubmitter from './useTranscriptDraftSubmitter';

const SEGMENT = { id: 's1', timeBoxIndex: 0, team: null };

function wrapper({ children }: { children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>;
}

function prepareEndedDraft(tableId: number, text = '찬성 입론') {
  const context = startTranscriptDraft(tableId, 1000);
  appendUtterance(tableId, SEGMENT, text, 2000);
  markTranscriptDraftEnded(tableId, 5000);
  return context;
}

function respondWith(id: number) {
  const handler = vi.fn();
  server.use(
    http.post(`${ApiUrl.transcript}/:tableId`, async ({ params, request }) => {
      handler(params.tableId, await request.json());
      return HttpResponse.json({ id }, { status: 201 });
    }),
  );
  return handler;
}

describe('토론 기록 초안 제출기', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('끝낸 초안을 한 번만 보내고 기록 ID를 보관한 뒤 초안을 지운다', async () => {
    prepareEndedDraft(5);
    const handler = respondWith(31);

    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(31));
    expect(getTranscriptDraft(5)).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('5', {
      segments: [
        {
          timeBoxIndex: 0,
          team: null,
          utterances: [{ offsetMs: 1000, text: '찬성 입론' }],
        },
      ],
      sttMode: 'RPC',
    });
  });

  it('끝내지 않은 초안은 보내지 않는다', async () => {
    startTranscriptDraft(5, 1000);
    appendUtterance(5, SEGMENT, '진행 중인 토론', 2000);
    const handler = respondWith(31);

    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

    expect(handler).not.toHaveBeenCalled();
    expect(getTranscriptDraft(5)).not.toBeNull();
  });

  it('제출기가 먼저 떠 있어도 나중에 끝낸 초안을 보낸다', async () => {
    startTranscriptDraft(5, 1000);
    appendUtterance(5, SEGMENT, '찬성 입론', 2000);
    respondWith(31);
    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });

    act(() => markTranscriptDraftEnded(5, 5000));

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(31));
  });

  it('전사 중인 구간이 끝날 때까지 기다린 뒤 보낸다', async () => {
    const context = startTranscriptDraft(5, 1000, 'SONIOX');
    markSegmentPending(context, 'p1', Date.now());
    markTranscriptDraftEnded(5, 5000);
    const handler = respondWith(77);
    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(handler).not.toHaveBeenCalled();

    act(() =>
      appendSegmentUtterances(context, { ...SEGMENT, id: 'p1' }, 2000, [
        { offsetMs: 0, text: '마지막 발언' },
      ]),
    );

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(77));
    expect(handler.mock.calls[0][1]).toMatchObject({ sttMode: 'SONIOX' });
  });

  it('전사가 끝났는데 발언이 없으면 보내지 않고 초안을 지운다', async () => {
    startTranscriptDraft(5, 1000, 'SONIOX');
    markTranscriptDraftEnded(5, 5000);
    const handler = respondWith(77);

    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });

    await waitFor(() => expect(getTranscriptDraft(5)).toBeNull());
    expect(handler).not.toHaveBeenCalled();
  });

  it('같은 테이블로 새 기록을 시작해도 보관한 이전 초안을 보낸다', async () => {
    prepareEndedDraft(5, '이전 토론');
    startTranscriptDraft(5, 9000);
    const handler = respondWith(40);

    renderHook(() => useTranscriptDraftSubmitter(), { wrapper });

    await waitFor(() => expect(listEndedTranscriptDrafts()).toEqual([]));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(getTranscriptDraft(5)?.startedAt).toBe(9000);
    expect(getSubmittedTranscriptId(5)).toBeNull();
  });

  it('실패하면 간격을 두고 다시 보내고 모두 실패하면 다시 시도를 기다린다', async () => {
    prepareEndedDraft(5);
    const attempts = vi.fn();
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () => {
        attempts();
        return HttpResponse.json({ message: 'error' }, { status: 500 });
      }),
    );

    renderHook(
      () => useTranscriptDraftSubmitter({ retryDelaysMs: [10, 10] }),
      { wrapper },
    );

    await waitFor(() =>
      expect(getTranscriptDraft(5)?.isSubmitFailed).toBe(true),
    );
    expect(attempts).toHaveBeenCalledTimes(3);

    respondWith(52);
    act(() => retryTranscriptSubmit(5));

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(52));
  });

  it('다시 보내는 사이 성공하면 실패로 남기지 않는다', async () => {
    prepareEndedDraft(5);
    let failures = 1;
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () => {
        if (failures > 0) {
          failures -= 1;
          return HttpResponse.json({ message: 'error' }, { status: 500 });
        }
        return HttpResponse.json({ id: 60 }, { status: 201 });
      }),
    );

    renderHook(
      () => useTranscriptDraftSubmitter({ retryDelaysMs: [10, 10] }),
      { wrapper },
    );

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(60));
    expect(getTranscriptDraft(5)).toBeNull();
  });
});
