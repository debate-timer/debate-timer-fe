// jsdom의 FormData·Blob 본문은 MSW가 읽지 못해 끝나지 않으므로 Node 환경에서 검증한다.
// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import axiosInstance from '../axiosInstance';
import { ApiUrl } from '../endpoints';
import { postRecordingTurnV2 } from './recordingV2';

const audio = () =>
  new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/webm' });

describe('다기기 녹음 V2 턴 업로드 API', () => {
  beforeEach(() => {
    // Node 환경에는 요청 인터셉터가 읽는 localStorage와 상대 경로의 기준 주소가 없다.
    vi.stubGlobal('localStorage', { getItem: () => null });
    axiosInstance.defaults.baseURL = 'http://localhost';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    axiosInstance.defaults.baseURL = undefined;
  });

  it('기기 토큰 헤더와 함께 턴 오디오·턴 정보·품질 지표를 multipart로 보낸다', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(
        `http://localhost${ApiUrl.recordingV2}/:sessionKey/turns/:turnKey`,
        async ({ params, request }) => {
          expect(params.sessionKey).toBe('session-1');
          expect(params.turnKey).toBe('0-12');
          expect(request.headers.get('X-Recording-Device')).toBe(
            'device-token',
          );
          expect(request.headers.get('content-type')).toContain(
            'multipart/form-data',
          );
          received = await request.formData();
          return new HttpResponse(null, { status: 202 });
        },
      ),
    );

    await postRecordingTurnV2('session-1', '0-12', 'device-token', {
      audio: audio(),
      fileName: 'segment.webm',
      timeBoxIndex: 0,
      team: 'PROS',
      durationMs: 180_000,
      startedAtEpochMs: 1_762_905_600_000,
      metrics: {
        rmsDb: -21.5,
        peakDb: -2.1,
        clippingRatio: 0,
        silenceRatio: 0.18,
        snrDb: 28.4,
      },
    });

    const audioPart = received?.get('audio') as File;
    expect(audioPart.name).toBe('segment.webm');
    expect(audioPart.size).toBe(3);
    expect(
      Object.fromEntries(
        [...(received?.entries() ?? [])].filter(([key]) => key !== 'audio'),
      ),
    ).toEqual({
      timeBoxIndex: '0',
      team: 'PROS',
      durationMs: '180000',
      startedAtEpochMs: '1762905600000',
      rmsDb: '-21.5',
      peakDb: '-2.1',
      clippingRatio: '0',
      silenceRatio: '0.18',
      snrDb: '28.4',
    });
  });

  it('팀과 품질 지표가 없으면 해당 값을 보내지 않는다', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(
        `http://localhost${ApiUrl.recordingV2}/:sessionKey/turns/:turnKey`,
        async ({ request }) => {
          received = await request.formData();
          return new HttpResponse(null, { status: 202 });
        },
      ),
    );

    await postRecordingTurnV2('session-1', '1-15', 'device-token', {
      audio: audio(),
      fileName: 'segment.webm',
      timeBoxIndex: 1,
      team: null,
      durationMs: 1_000,
      startedAtEpochMs: 0,
      metrics: null,
    });

    expect([...(received?.keys() ?? [])].sort()).toEqual([
      'audio',
      'durationMs',
      'startedAtEpochMs',
      'timeBoxIndex',
    ]);
  });
});
