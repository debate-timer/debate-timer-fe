// jsdom의 FormData·Blob 본문은 MSW가 읽지 못하므로 핸들러를 Node 환경에서 직접 호출한다.
// @vitest-environment node
import { getResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import { recordingV2Handlers } from './recordingV2';

const BASE_URL = 'http://localhost';

const call = (method: string, path: string, body?: BodyInit) =>
  getResponse(
    recordingV2Handlers,
    new Request(`${BASE_URL}${path}`, { method, body }),
    { baseUrl: BASE_URL },
  );

const createSession = async () => {
  const response = await call(
    'POST',
    ApiUrl.recordingV2,
    JSON.stringify({ tableId: 1, language: 'ko-KR' }),
  );
  return ((await response?.json()) as { sessionKey: string }).sessionKey;
};

describe('다기기 녹음 V2 mock 핸들러', () => {
  it('취소한 세션에는 참가와 업로드를 거절한다', async () => {
    const sessionKey = await createSession();
    await call('POST', `${ApiUrl.recordingV2}/${sessionKey}/cancel`);

    const joined = await call(
      'POST',
      `${ApiUrl.recordingV2}/${sessionKey}/devices`,
      JSON.stringify({ joinCode: 'mock-join-code' }),
    );
    const form = new FormData();
    form.append('audio', new Blob([new Uint8Array([1])]), 'turn.webm');
    const uploaded = await call(
      'POST',
      `${ApiUrl.recordingV2}/${sessionKey}/turns/0-1`,
      form,
    );

    expect(joined?.status).toBe(409);
    expect(uploaded?.status).toBe(403);
  });

  it('녹음 중인 세션에는 참가와 업로드를 받는다', async () => {
    const sessionKey = await createSession();

    const joined = await call(
      'POST',
      `${ApiUrl.recordingV2}/${sessionKey}/devices`,
      JSON.stringify({ joinCode: 'mock-join-code' }),
    );
    const form = new FormData();
    form.append('audio', new Blob([new Uint8Array([1])]), 'turn.webm');
    const uploaded = await call(
      'POST',
      `${ApiUrl.recordingV2}/${sessionKey}/turns/0-1`,
      form,
    );

    expect(joined?.status).toBe(201);
    expect(uploaded?.status).toBe(202);
  });
});
