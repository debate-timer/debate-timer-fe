import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import {
  PatchPollResponseType,
  PostPollResponseType,
  PostVoterPollInfoResponseType,
} from '../../apis/responses/poll';

export const customizeHandlers = [
  // GET /api/table/customize/{tableId}
  http.get(ApiUrl.poll + '/:pollId', ({ params }) => {
    const { pollId } = params;
    console.log(`# pollId  = ${pollId}`);

    return HttpResponse.json({
      id: 7,
      status: 'PROGRESS',
      prosTeamName: '찬성',
      consTeamName: '반대',
      totalCount: 1,
      prosCount: 1,
      consCount: 0,
      voterNames: ['ㅇㄹㄴ', 'ㅁㄴㅇ'],
    });
  }),

  // POST /api/polls/{tableId}
  http.post(ApiUrl.poll + '/:tableId', async ({ request }) => {
    const result = (await request.json()) as PostPollResponseType;
    console.log(
      `# tableId = ${result?.id}, prosTeamName = ${result?.prosTeamName}, consTeamName = ${result?.consTeamName}`,
    );
    return HttpResponse.json({
      id: 7,
      status: 'PROGRESS',
      prosTeamName: '찬성',
      consTeamName: '반대',
    });
  }),

  // PATCH /api/polls/{pollId}
  http.patch(ApiUrl.poll + '/:pollId', async ({ request }) => {
    const result = (await request.json()) as PatchPollResponseType;
    console.log(
      `pollId = ${result?.id}, status = ${result?.status}, prosTeamName = ${result?.prosTeamName}, consTeamName = ${result?.consTeamName}`,
    );

    return HttpResponse.json({
      id: 7,
      status: 'DONE',
      prosTeamName: '찬성',
      consTeamName: '반대',
      totalCount: 1,
      prosCount: 1,
      consCount: 0,
      voterNames: ['ㅇㄹㄴ', 'ㅁㄴㅇ'],
    });
  }),

  // GET /api/polls/{pollId}/votes
  http.delete(ApiUrl.poll + `/:pollId/votes`, ({ params }) => {
    const { pollId } = params;
    console.log(`# pollId  = ${pollId}`);

    return HttpResponse.json({
      id: 7,
      status: 'PROGRESS',
      prosTeamName: '찬성',
      consTeamName: '반대',
      participateCode: '494bcec7-f8e8-4e96-8922-511cd7114a07',
      totalCount: 1,
      prosCount: 1,
      consCount: 0,
    });
  }),

  // POST /api/polls/{pollId}/votes
  http.patch(ApiUrl.poll + '/:pollId/votes', async ({ request, params }) => {
    const { pollId } = params;
    const result = (await request.json()) as PostVoterPollInfoResponseType;
    console.log(
      `# tableId = ${pollId}, name = ${result?.name}, participateCode = ${result?.participateCode}, team = ${result?.team}`,
    );

    return HttpResponse.json({
      id: 7,
      name: 'ㅇㄹㄴ',
      participateCode: 'string',
      team: 'PROS',
    });
  }),
];
