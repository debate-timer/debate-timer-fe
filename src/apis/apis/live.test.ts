import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { GetDebateTableDataForShareResponseType } from '../responses/live';
import { getDebateTableDataForShare } from './live';

const mockDebateTableForShare: GetDebateTableDataForShareResponseType = {
  id: 302,
  info: {
    name: '공유용 자유토론 테이블',
    agenda: '공유 토론 주제',
    prosTeamName: '찬성',
    consTeamName: '반대',
  },
  table: [
    {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      bell: null,
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 60,
      timePerSpeaking: 30,
      speaker: null,
    },
  ],
};

describe('라이브 공유 테이블 조회 API', () => {
  test('테이블 ID로 공유용 토론 테이블 데이터를 조회한다', async () => {
    server.use(
      http.get(`${ApiUrl.live}/table/customize/:tableId`, ({ params }) => {
        expect(params.tableId).toBe('302');

        return HttpResponse.json(mockDebateTableForShare);
      }),
    );

    const data = await getDebateTableDataForShare(302);

    expect(data).toEqual(mockDebateTableForShare);
  });
});
