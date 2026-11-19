import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import {
  appendUtterance,
  getSubmittedTranscriptId,
  markTranscriptDraftEnded,
  startTranscriptDraft,
} from '../util/transcriptDraft';
import TranscriptDraftSubmitter from './TranscriptDraftSubmitter';

describe('라우터 최상위 토론 기록 제출기', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('어느 화면에서든 끝낸 토론 기록을 제출한다', async () => {
    startTranscriptDraft(5, 1000);
    appendUtterance(
      5,
      { id: 's1', timeBoxIndex: 0, team: null },
      '찬성 입론',
      2000,
    );
    markTranscriptDraftEnded(5, 5000);
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () =>
        HttpResponse.json({ id: 21 }, { status: 201 }),
      ),
    );

    render(<TranscriptDraftSubmitter />);

    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(21));
  });
});
