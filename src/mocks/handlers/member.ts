import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';

export const memberHandlers = [
  // GET /api/member/feature-flags
  // 개발 모드에서는 모든 기능을 볼 수 있도록 전부 내려준다.
  http.get(`${ApiUrl.member}/feature-flags`, () => {
    return HttpResponse.json({ featureFlags: ['TRANSCRIPT'] });
  }),

  // POST "/api/member"
  http.post(ApiUrl.member, async () => {
    return HttpResponse.json({
      id: 1,
      nickname: '홍길동',
    });
  }),

  // GET /api/table?memberId={memberId}
  http.get(ApiUrl.table, ({ request }) => {
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');
    console.log(`# memberId = ${memberId}`);

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
        {
          id: 3,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 4,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
        {
          id: 5,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 6,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
        {
          id: 7,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 8,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
      ],
    });
  }),
];
