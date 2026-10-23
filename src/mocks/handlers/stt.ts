import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import { PostSonioxTranscriptionResponseType } from '../../apis/responses/stt';

export const sttHandlers = [
  // POST /api/stt/soniox
  http.post(ApiUrl.stt + '/soniox', () => {
    const response: PostSonioxTranscriptionResponseType = {
      utterances: [
        { offsetMs: 500, text: '모의 Soniox 전사 문장입니다.' },
        { offsetMs: 2500, text: '구간이 끝나면 한 번에 전사됩니다.' },
      ],
    };
    return HttpResponse.json(response);
  }),
];
