import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../apis/endpoints';

export const handlers = [
  // POST new member
  http.post(ApiUrl.member, () => {
    return HttpResponse.json({
      nickname: '홍길동',
    });
  }),

  // GET specific member's tables
  http.get(ApiUrl.table, () => {
    return HttpResponse.json({
      tables: [
        {
          id: 1,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 2,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
      ],
    });
  }),

  // GET specific table data
  http.get(ApiUrl.parliamentary, () => {
    return HttpResponse.json({
      id: 1,
      info: {
        name: '테이블 1',
        agenda: '촉법소년 연령 인하',
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
          stance: 'NETURAL',
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

  // POST new table data
  http.post(ApiUrl.parliamentary, () => {
    return HttpResponse.json({
      info: {
        name: '테이블1',
        agenda: '촉법소년 연령 인하',
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
          stance: 'NETURAL',
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

  // PUT specific table data to new one
  http.put(ApiUrl.parliamentary, () => {
    return HttpResponse.json({
      info: {
        name: '테이블1',
        agenda: '촉법소년 연령 인하',
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
          stance: 'NETURAL',
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

  // DELETE specific table data
  http.delete(ApiUrl.parliamentary, () => {
    return HttpResponse.text('', { status: 204 });
  }),
];
