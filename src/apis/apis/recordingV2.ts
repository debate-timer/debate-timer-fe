import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import {
  PostRecordingDeviceV2RequestType,
  PostRecordingSessionV2RequestType,
  PostRecordingTurnV2RequestType,
} from '../requests/recordingV2';
import {
  GetRecordingSessionV2ResponseType,
  PostRecordingSessionV2ResponseType,
  RecordingDeviceV2ResponseType,
} from '../responses/recordingV2';

// 턴 업로드 때 기기 업로드 토큰을 담는 헤더
export const RECORDING_DEVICE_HEADER = 'X-Recording-Device';

// 서버는 받아 두기만 하고 바로 응답하지만, 큰 오디오를 느린 망에서 올리는 시간을 둔다.
const TURN_UPLOAD_TIMEOUT_MS = 120_000;

const sessionUrl = (sessionKey: string) =>
  `${ApiUrl.recordingV2}/${encodeURIComponent(sessionKey)}`;

// POST /api/v2/recordings
export async function postRecordingSessionV2(
  body: PostRecordingSessionV2RequestType,
): Promise<PostRecordingSessionV2ResponseType> {
  const response = await request<PostRecordingSessionV2ResponseType>(
    'POST',
    ApiUrl.recordingV2,
    body,
    null,
  );

  return response.data;
}

// POST /api/v2/recordings/{sessionKey}/devices
export async function postRecordingDeviceV2(
  sessionKey: string,
  body: PostRecordingDeviceV2RequestType,
): Promise<RecordingDeviceV2ResponseType> {
  const response = await request<RecordingDeviceV2ResponseType>(
    'POST',
    `${sessionUrl(sessionKey)}/devices`,
    body,
    null,
  );

  return response.data;
}

// POST /api/v2/recordings/{sessionKey}/host-device
export async function postRecordingHostDeviceV2(
  sessionKey: string,
): Promise<RecordingDeviceV2ResponseType> {
  const response = await request<RecordingDeviceV2ResponseType>(
    'POST',
    `${sessionUrl(sessionKey)}/host-device`,
    null,
    null,
  );

  return response.data;
}

// POST /api/v2/recordings/{sessionKey}/turns/{turnKey}
export async function postRecordingTurnV2(
  sessionKey: string,
  turnKey: string,
  deviceToken: string,
  turn: PostRecordingTurnV2RequestType,
): Promise<void> {
  const body = new FormData();
  body.append('audio', turn.audio, turn.fileName);
  body.append('timeBoxIndex', String(turn.timeBoxIndex));
  if (turn.team !== null) {
    body.append('team', turn.team);
  }
  body.append('durationMs', String(Math.round(turn.durationMs)));
  body.append('startedAtEpochMs', String(Math.round(turn.startedAtEpochMs)));
  if (turn.metrics !== null) {
    Object.entries(turn.metrics).forEach(([name, value]) =>
      body.append(name, String(value)),
    );
  }
  await request<void>(
    'POST',
    `${sessionUrl(sessionKey)}/turns/${encodeURIComponent(turnKey)}`,
    body,
    null,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        [RECORDING_DEVICE_HEADER]: deviceToken,
      },
      timeout: TURN_UPLOAD_TIMEOUT_MS,
    },
  );
}

// POST /api/v2/recordings/{sessionKey}/finish
export async function postRecordingFinishV2(sessionKey: string): Promise<void> {
  await request<void>('POST', `${sessionUrl(sessionKey)}/finish`, null, null);
}

// GET /api/v2/recordings/{sessionKey}
export async function getRecordingSessionV2(
  sessionKey: string,
): Promise<GetRecordingSessionV2ResponseType> {
  const response = await request<GetRecordingSessionV2ResponseType>(
    'GET',
    sessionUrl(sessionKey),
    null,
    null,
  );

  return response.data;
}
