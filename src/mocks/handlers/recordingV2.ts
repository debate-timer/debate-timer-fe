import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import {
  GetRecordingSessionV2ResponseType,
  PostRecordingSessionV2ResponseType,
  RecordingDeviceV2ResponseType,
} from '../../apis/responses/recordingV2';
import { RecordingSessionStatusV2 } from '../../types/recordingV2';

// 끝낸 뒤 조회할 때마다 FINISHING → COMPLETED로 넘어가 속기록 대기 화면을 확인할 수 있게 한다.
const statuses = new Map<string, RecordingSessionStatusV2>();
let sequence = 0;

const nextDevice = (): RecordingDeviceV2ResponseType => {
  sequence += 1;
  return { deviceId: `mock${sequence}`, deviceToken: `mock-token-${sequence}` };
};

export const recordingV2Handlers = [
  // POST /api/v2/recordings
  http.post(ApiUrl.recordingV2, () => {
    const sessionKey = `mock-session-${sequence + 1}`;
    statuses.set(sessionKey, 'RECORDING');
    const response: PostRecordingSessionV2ResponseType = {
      sessionKey,
      joinCode: 'mock-join-code',
      ...nextDevice(),
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // POST /api/v2/recordings/{sessionKey}/devices
  http.post(`${ApiUrl.recordingV2}/:sessionKey/devices`, () =>
    HttpResponse.json(nextDevice(), { status: 201 }),
  ),

  // POST /api/v2/recordings/{sessionKey}/host-device
  http.post(`${ApiUrl.recordingV2}/:sessionKey/host-device`, () =>
    HttpResponse.json(nextDevice(), { status: 201 }),
  ),

  // POST /api/v2/recordings/{sessionKey}/turns/{turnKey}
  http.post(
    `${ApiUrl.recordingV2}/:sessionKey/turns/:turnKey`,
    () => new HttpResponse(null, { status: 202 }),
  ),

  // POST /api/v2/recordings/{sessionKey}/finish
  http.post(`${ApiUrl.recordingV2}/:sessionKey/finish`, ({ params }) => {
    statuses.set(params.sessionKey as string, 'FINISHING');
    return new HttpResponse(null, { status: 202 });
  }),

  // GET /api/v2/recordings/{sessionKey}
  http.get(`${ApiUrl.recordingV2}/:sessionKey`, ({ params }) => {
    const sessionKey = params.sessionKey as string;
    const status = statuses.get(sessionKey) ?? 'RECORDING';
    if (status === 'FINISHING') {
      statuses.set(sessionKey, 'COMPLETED');
    }
    const response: GetRecordingSessionV2ResponseType = {
      sessionKey,
      status,
      transcriptId: status === 'COMPLETED' ? 1 : null,
      errorMessage: null,
      turns: [
        {
          turnKey: '0-1',
          timeBoxIndex: 0,
          team: null,
          status: status === 'RECORDING' ? 'PROCESSING' : 'DONE',
          candidateCount: 2,
          selectedDeviceId: status === 'RECORDING' ? null : 'mock1',
          errorMessage: null,
        },
      ],
    };
    return HttpResponse.json(response);
  }),
];
