// jsdom의 FormData·Blob 본문은 MSW가 읽지 못해 끝나지 않으므로 Node 환경에서 검증한다.
// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import axiosInstance from '../axiosInstance';
import { ApiUrl } from '../endpoints';
import { PostSonioxTranscriptionResponseType } from '../responses/stt';
import { postSonioxTranscription } from './stt';

describe('음성 전사 API', () => {
  beforeEach(() => {
    // Node 환경에는 요청 인터셉터가 읽는 localStorage와 상대 경로의 기준 주소가 없다.
    vi.stubGlobal('localStorage', { getItem: () => null });
    axiosInstance.defaults.baseURL = 'http://localhost';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    axiosInstance.defaults.baseURL = undefined;
  });

  it('발언 구간 오디오와 언어를 multipart로 보내 Soniox 전사 문장을 받는다', async () => {
    const response: PostSonioxTranscriptionResponseType = {
      utterances: [{ offsetMs: 300, text: '찬성 입론입니다.' }],
    };
    server.use(
      http.post(`http://localhost${ApiUrl.stt}/soniox`, async ({ request }) => {
        expect(request.headers.get('content-type')).toContain(
          'multipart/form-data',
        );
        const form = await request.formData();
        const audio = form.get('audio') as File;
        expect(audio.name).toBe('segment.webm');
        expect(audio.size).toBe(3);
        expect(form.get('language')).toBe('ko-KR');
        return HttpResponse.json(response);
      }),
    );

    const data = await postSonioxTranscription(
      new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' }),
      'segment.webm',
      'ko-KR',
    );

    expect(data).toEqual(response);
  });
});
