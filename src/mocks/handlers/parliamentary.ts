import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import { PostDebateTableResponseType } from '../../apis/responses/parliamentary';

export const parliamentaryHandlers = [
  // GET /api/table/parliamentary/{tableId}
  http.get(ApiUrl.parliamentary + '/:tableId', ({ params }) => {
    const { tableId } = params;
    console.log(`# tableId  = ${tableId}`);

    return HttpResponse.json({
      id: 1,
      info: {
        name: '테이블 1',
        agenda: '촉법소년 기준 연령을 인하해야 한다.',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          type: 'OPENING',
          time: 40,
          speakerNumber: 1,
        },
        {
          stance: 'CONS',
          type: 'OPENING',
          time: 40,
          speakerNumber: 1,
        },
        {
          stance: 'CONS',
          type: 'CLOSING',
          time: 35,
          speakerNumber: 2,
        },
        {
          stance: 'PROS',
          type: 'CLOSING',
          time: 35,
          speakerNumber: 2,
        },
      ],
    });
  }),

  // POST /api/table/parliamentary
  http.post(ApiUrl.parliamentary, async ({ request }) => {
    const result = (await request.json()) as PostDebateTableResponseType;
    // This console log calling shows error(ts(2339)) but will be executed with any problems.
    console.log(
      `# tableAgenda = ${result?.info.agenda}, tableName = ${result?.info.name}`,
    );

    return HttpResponse.json({
      id: 1,
      info: {
        name: '테이블1',
        agenda: '촉법소년 연령 인하',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          type: 'OPENING',
          time: 175,
          speakerNumber: 1,
        },
        {
          stance: 'CONS',
          type: 'OPENING',
          time: 175,
          speakerNumber: 1,
        },
        {
          stance: 'NEUTRAL',
          type: 'TIME_OUT',
          time: 180,
          speakerNumber: null,
        },
        {
          stance: 'CONS',
          type: 'CLOSING',
          time: 120,
          speakerNumber: 2,
        },
        {
          stance: 'PRONS',
          type: 'CLOSING',
          time: 120,
          speakerNumber: 2,
        },
      ],
    });
  }),

  // PUT /api/table/parliamentary/{tableId}?memberId={memberId}
  http.put(ApiUrl.parliamentary + '/:tableId', async ({ request, params }) => {
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');
    const { tableId } = params;
    const result = (await request.json()) as PostDebateTableResponseType;
    console.log(
      `# tableId = ${tableId}, memberId = ${memberId}, tableAgenda = ${result?.info.agenda}, tableName = ${result?.info.name}`,
    );

    return HttpResponse.json({
      info: {
        name: '테이블1',
        agenda: '촉법소년 연령 인하',
        warningBell: true,
        finishBell: true,
      },
      table: [
        {
          stance: 'PROS',
          type: 'OPENING',
          time: 175,
          speakerNumber: 1,
        },
        {
          stance: 'CONS',
          type: 'OPENING',
          time: 175,
          speakerNumber: 1,
        },
        {
          stance: 'NEUTRAL',
          type: 'TIME_OUT',
          time: 180,
          speakerNumber: null,
        },
        {
          stance: 'CONS',
          type: 'CLOSING',
          time: 120,
          speakerNumber: 2,
        },
        {
          stance: 'PRONS',
          type: 'CLOSING',
          time: 120,
          speakerNumber: 2,
        },
      ],
    });
  }),

  // DELETE /api/table/parliamentary/{tableId}
  http.delete(ApiUrl.parliamentary + '/:tableId', ({ params }) => {
    const { tableId } = params;
    console.log(`# tableId  = ${tableId}`);

    return new HttpResponse(null, {
      status: 204,
    });
  }),

  // PATCH /api/table/parliamentary/{tableId}
  // TODO
];
