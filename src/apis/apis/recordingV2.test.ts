import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import {
  GetRecordingSessionV2ResponseType,
  PostRecordingSessionV2ResponseType,
  RecordingDeviceV2ResponseType,
} from '../responses/recordingV2';
import {
  getRecordingSessionV2,
  postRecordingDeviceV2,
  postRecordingFinishV2,
  postRecordingHostDeviceV2,
  postRecordingSessionV2,
} from './recordingV2';

const device: RecordingDeviceV2ResponseType = {
  deviceId: 'aUdI01',
  deviceToken: 'device-token',
};

describe('다기기 녹음 V2 API', () => {
  it('테이블 ID와 언어로 녹음 세션을 연다', async () => {
    const response: PostRecordingSessionV2ResponseType = {
      sessionKey: 'session-1',
      joinCode: 'join-code',
      deviceId: 'hOsT01',
      deviceToken: 'host-token',
    };
    server.use(
      http.post(ApiUrl.recordingV2, async ({ request }) => {
        expect(await request.json()).toEqual({ tableId: 5, language: 'ko-KR' });
        return HttpResponse.json(response, { status: 201 });
      }),
    );

    const data = await postRecordingSessionV2({
      tableId: 5,
      language: 'ko-KR',
    });

    expect(data).toEqual(response);
  });

  it('참가 코드로 청중 기기를 참가시킨다', async () => {
    server.use(
      http.post(
        `${ApiUrl.recordingV2}/:sessionKey/devices`,
        async ({ params, request }) => {
          expect(params.sessionKey).toBe('session/1');
          expect(await request.json()).toEqual({ joinCode: 'join-code' });
          return HttpResponse.json(device, { status: 201 });
        },
      ),
    );

    const data = await postRecordingDeviceV2('session/1', {
      joinCode: 'join-code',
    });

    expect(data).toEqual(device);
  });

  it('사회자 기기로 다시 참가한다', async () => {
    server.use(
      http.post(
        `${ApiUrl.recordingV2}/:sessionKey/host-device`,
        ({ params }) => {
          expect(params.sessionKey).toBe('session-1');
          return HttpResponse.json(device, { status: 201 });
        },
      ),
    );

    expect(await postRecordingHostDeviceV2('session-1')).toEqual(device);
  });

  it('녹음 세션을 끝낸다', async () => {
    let finishedSessionKey: string | undefined;
    server.use(
      http.post(`${ApiUrl.recordingV2}/:sessionKey/finish`, ({ params }) => {
        finishedSessionKey = params.sessionKey as string;
        return new HttpResponse(null, { status: 202 });
      }),
    );

    await postRecordingFinishV2('session-1');

    expect(finishedSessionKey).toBe('session-1');
  });

  it('녹음 세션과 턴별 처리 상태를 조회한다', async () => {
    const response: GetRecordingSessionV2ResponseType = {
      sessionKey: 'session-1',
      status: 'COMPLETED',
      transcriptId: 42,
      errorMessage: null,
      turns: [
        {
          turnKey: '0-12',
          timeBoxIndex: 0,
          team: null,
          status: 'DONE',
          candidateCount: 3,
          selectedDeviceId: 'aUdI01',
          errorMessage: null,
        },
      ],
    };
    server.use(
      http.get(`${ApiUrl.recordingV2}/:sessionKey`, ({ params }) => {
        expect(params.sessionKey).toBe('session-1');
        return HttpResponse.json(response);
      }),
    );

    expect(await getRecordingSessionV2('session-1')).toEqual(response);
  });
});
