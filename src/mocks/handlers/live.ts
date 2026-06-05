import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import { GetChairmanTokenResponseType } from '../../apis/responses/live';

export const liveHandlers = [
  http.get(`${ApiUrl.live}/:tableId/chairman-token`, ({ params }) => {
    const { tableId } = params;
    console.log(`# Table ID = ${tableId}`);

    const response: GetChairmanTokenResponseType = {
      chairmanToken: 'mock-chairman-token-12345',
    };

    return HttpResponse.json(response);
  }),
];
