import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import {
  PostCustomizeTableResponseType,
  PutCustomizeTableResponseType,
} from '../../apis/responses/customize';

export const customizeHandlers = [
  // GET /api/table/customize/{tableId}
  http.get(ApiUrl.customize + '/:tableId', ({ params }) => {
    const { tableId } = params;
    console.log(`# tableId  = ${tableId}`);

    return HttpResponse.json({
      id: 5,
      info: {
        name: '나의 자유토론 테이블',
        type: 'CUSTOMIZE',
        agenda: '토론 주제',
        prosTeamName: '찬성',
        consTeamName: '반대',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 60,
          timePerSpeaking: 30,
          speaker: null,
        },
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 60,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'NEUTRAL',
          speechType: '작전 시간',
          boxType: 'NORMAL',
          time: 60,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'CONS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
        {
          stance: 'PROS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
      ],
    });
  }),

  // POST /api/table/customize
  http.post(ApiUrl.customize, async ({ request }) => {
    const result = (await request.json()) as PostCustomizeTableResponseType;
    console.log(
      `# tableAgenda = ${result?.info.agenda}, tableName = ${result?.info.name}`,
    );

    return HttpResponse.json({
      id: 1,
      info: {
        name: '나의 자유토론 테이블',
        type: 'CUSTOMIZE',
        agenda: '토론 주제',
        prosTeamName: '찬성',
        consTeamName: '반대',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'NEUTRAL',
          speechType: '작전 시간',
          boxType: 'NORMAL',
          time: 60,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 120,
          timePerSpeaking: 40,
          speaker: null,
        },
        {
          stance: 'CONS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
        {
          stance: 'PROS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
      ],
    });
  }),

  // PUT /api/table/customize/{tableId}
  http.put(ApiUrl.customize + '/:tableId', async ({ request, params }) => {
    const { tableId } = params;
    const result = (await request.json()) as PutCustomizeTableResponseType;
    console.log(
      `# tableId = ${tableId}, tableAgenda = ${result?.info.agenda}, tableName = ${result?.info.name}`,
    );

    return HttpResponse.json({
      info: {
        name: '나의 자유토론 테이블',
        type: 'CUSTOMIZE',
        agenda: '토론 주제',
        prosTeamName: '찬성',
        consTeamName: '반대',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'NEUTRAL',
          speechType: '작전 시간',
          boxType: 'NORMAL',
          time: 60,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 120,
          timePerSpeaking: 40,
          speaker: null,
        },
        {
          stance: 'CONS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
        {
          stance: 'PROS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
      ],
    });
  }),

  // DELETE /api/table/customize/{tableId}
  http.delete(ApiUrl.customize + '/:tableId', ({ params }) => {
    const { tableId } = params;
    console.log(`# tableId  = ${tableId}`);

    return new HttpResponse(null, {
      status: 204,
    });
  }),

  // PATCH /api/table/customize/{tableId}
  http.patch(ApiUrl.customize + '/:tableId', async ({ request, params }) => {
    const { tableId } = params;
    const result = (await request.json()) as PutCustomizeTableResponseType;
    console.log(
      `# tableId = ${tableId}, tableAgenda = ${result?.info.agenda}, tableName = ${result?.info.name}`,
    );

    return HttpResponse.json({
      id: 302,
      info: {
        name: '나의 자유토론 테이블',
        type: 'CUSTOMIZE',
        agenda: '토론 주제',
        prosTeamName: '찬성',
        consTeamName: '반대',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'PROS',
          speechType: '입론',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'NEUTRAL',
          speechType: '작전 시간',
          boxType: 'NORMAL',
          time: 60,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 120,
          timePerSpeaking: 40,
          speaker: null,
        },
        {
          stance: 'CONS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
        {
          stance: 'PROS',
          speechType: '최종 발언',
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
      ],
    });
  }),
];
