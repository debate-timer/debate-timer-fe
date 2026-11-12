import { expectTypeOf } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { GetVoterPollInfoResponseType } from '../responses/poll';
import { getVoterPollInfo } from './poll';

describe('공개 투표 조회 API', () => {
  it('모의 공개 응답에 이름·주제를 포함하고 참여자 이름은 포함하지 않는다', async () => {
    const response = await getVoterPollInfo(7);
    expect(response.id).toBe(7);
    expect(response.tableInfo).toEqual({
      name: '정기 토론회',
      agenda: '공유 토론 주제',
    });
    expect(response).not.toHaveProperty('voterNames');
    expectTypeOf<GetVoterPollInfoResponseType>().not.toHaveProperty(
      'voterNames',
    );
  });

  it.each(['PROGRESS', 'DONE'] as const)(
    '%s 투표의 기존 필드와 빈 공개 정보를 유지한다',
    async (status) => {
      const response = {
        id: 37,
        status,
        prosTeamName: '찬성',
        consTeamName: '반대',
        totalCount: 0,
        prosCount: 0,
        consCount: 0,
        participateCode: 'code',
        tableInfo: { name: '', agenda: '' },
      };
      server.use(
        http.get('/api/polls/:pollId/votes', ({ request, params }) => {
          expect(request.method).toBe('GET');
          expect(params.pollId).toBe('37');
          expect(new URL(request.url).search).toBe('');
          return HttpResponse.json(response);
        }),
      );
      expect(await getVoterPollInfo(37)).toEqual(response);
    },
  );

  it('조회 오류를 호출자에게 전달한다', async () => {
    server.use(
      http.get('/api/polls/:pollId/votes', () =>
        HttpResponse.json({ message: '없음' }, { status: 404 }),
      ),
    );
    await expect(getVoterPollInfo(37)).rejects.toMatchObject({ status: 404 });
  });
});
