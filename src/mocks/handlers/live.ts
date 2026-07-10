import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import {
  GetChairmanTokenResponseType,
  GetDebateTableDataForShareResponseType,
} from '../../apis/responses/live';

export const liveHandlers = [
  http.get(`${ApiUrl.live}/table/customize/:tableId`, ({ params }) => {
    const { tableId } = params;
    console.log(`# tableId = ${tableId}`);

    const response: GetDebateTableDataForShareResponseType = {
      id: 5,
      info: {
        name: '나의 자유토론 테이블',
        agenda: '토론 주제',
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
          timePerSpeaking: 33,
          speaker: null,
        },
        {
          stance: 'NEUTRAL',
          speechType: '자유토론',
          bell: null,
          boxType: 'TIME_BASED',
          time: null,
          timePerTeam: 35,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'PROS',
          speechType: '입론',
          bell: [
            { type: 'BEFORE_END', time: 0, count: 2 },
            { type: 'AFTER_START', time: 5, count: 1 },
          ],
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'PROS',
          speechType: '입론',
          bell: [
            { type: 'BEFORE_END', time: 0, count: 2 },
            { type: 'AFTER_START', time: 7, count: 3 },
          ],
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 1',
        },
        {
          stance: 'NEUTRAL',
          speechType: '작전 시간',
          bell: [{ type: 'BEFORE_END', time: 0, count: 2 }],
          boxType: 'NORMAL',
          time: 60,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
        {
          stance: 'CONS',
          speechType: '최종 발언',
          bell: [{ type: 'BEFORE_END', time: 0, count: 2 }],
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
        {
          stance: 'PROS',
          speechType: '최종 발언',
          bell: [{ type: 'BEFORE_END', time: 0, count: 2 }],
          boxType: 'NORMAL',
          time: 120,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: '발언자 2',
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  http.get(`${ApiUrl.live}/:tableId/chairman-token`, ({ params }) => {
    const { tableId } = params;
    console.log(`# Table ID = ${tableId}`);

    const response: GetChairmanTokenResponseType = {
      chairmanToken: 'mock-chairman-token-12345',
    };

    return HttpResponse.json(response);
  }),
];
