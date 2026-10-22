import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { PostTranscriptRequestType } from '../requests/transcript';
import { GetTranscriptResponseType } from '../responses/transcript';
import { getTranscript, postTranscript } from './transcript';

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
});
