import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { PostTranscriptRequestType } from '../requests/transcript';
import {
  GetSharedTranscriptResponseType,
  GetTranscriptResponseType,
  GetTranscriptsResponseType,
} from '../responses/transcript';
import {
  deleteTranscriptShare,
  getSharedTranscript,
  getTranscript,
  getTranscripts,
  postTranscript,
  postTranscriptShare,
} from './transcript';

const mockTranscript: GetTranscriptResponseType = {
  id: 11,
  tableId: 5,
  tableName: '정기토론',
  agenda: '노동시장 유연화를 확대해야 한다',
  prosTeamName: '찬성',
  consTeamName: '반대',
  status: 'PROCESSING',
  sttMode: 'SONIOX',
  refining: true,
  lines: [
    {
      index: 0,
      timeBoxIndex: 0,
      speechType: '입론',
      stance: 'PROS',
      speaker: '콜리',
      offsetMs: 1000,
      text: '찬성 입론입니다',
    },
  ],
  report: null,
  errorMessage: null,
  shareToken: null,
};

describe('토론 기록 API', () => {
  it('테이블 ID와 발언 구간을 보내 토론 기록을 생성한다', async () => {
    const body: PostTranscriptRequestType = {
      segments: [
        {
          timeBoxIndex: 0,
          team: null,
          utterances: [{ offsetMs: 1000, text: '찬성 입론입니다' }],
        },
      ],
      sttMode: 'SONIOX',
    };
    server.use(
      http.post(
        `${ApiUrl.transcript}/:tableId`,
        async ({ params, request }) => {
          expect(params.tableId).toBe('5');
          expect(await request.json()).toEqual(body);
          return HttpResponse.json({ id: 11 }, { status: 201 });
        },
      ),
    );

    const data = await postTranscript(5, body);

    expect(data).toEqual({ id: 11 });
  });

  it('기록 ID로 속기록과 분석 상태를 조회한다', async () => {
    server.use(
      http.get(`${ApiUrl.transcript}/:transcriptId`, ({ params }) => {
        expect(params.transcriptId).toBe('11');
        return HttpResponse.json(mockTranscript);
      }),
    );

    const data = await getTranscript(11);

    expect(data).toEqual(mockTranscript);
  });

  it('회원의 토론 기록 목록을 조회한다', async () => {
    const response: GetTranscriptsResponseType = {
      transcripts: [
        {
          id: 12,
          tableId: 5,
          tableName: '정기토론',
          agenda: '노동시장 유연화를 확대해야 한다',
          sttMode: 'SONIOX',
          status: 'PROCESSING',
          refining: true,
          createdAt: '2026-10-23T01:39:15',
        },
      ],
    };
    server.use(http.get(ApiUrl.transcript, () => HttpResponse.json(response)));

    const data = await getTranscripts();

    expect(data).toEqual(response);
  });

  it('기록 ID로 공유 링크 토큰을 발급받는다', async () => {
    server.use(
      http.post(`${ApiUrl.transcript}/:transcriptId/share`, ({ params }) => {
        expect(params.transcriptId).toBe('11');
        return HttpResponse.json({ shareToken: 'share-token' });
      }),
    );

    const data = await postTranscriptShare(11);

    expect(data).toEqual({ shareToken: 'share-token' });
  });

  it('기록 ID로 공유를 해제한다', async () => {
    let requestedId: string | undefined;
    server.use(
      http.delete(`${ApiUrl.transcript}/:transcriptId/share`, ({ params }) => {
        requestedId = String(params.transcriptId);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await deleteTranscriptShare(11);

    expect(requestedId).toBe('11');
  });

  it('공유 토큰으로 공유된 기록을 조회한다', async () => {
    const response: GetSharedTranscriptResponseType = {
      tableName: '정기토론',
      agenda: '노동시장 유연화를 확대해야 한다',
      prosTeamName: '찬성',
      consTeamName: '반대',
      status: 'DONE',
      refining: false,
      lines: mockTranscript.lines,
      report: null,
    };
    server.use(
      http.get(`${ApiUrl.sharedTranscript}/:shareToken`, ({ params }) => {
        expect(params.shareToken).toBe('a b');
        return HttpResponse.json(response);
      }),
    );

    const data = await getSharedTranscript('a b');

    expect(data).toEqual(response);
  });
});
