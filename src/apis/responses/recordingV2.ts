import {
  RecordingSessionStatusV2,
  RecordingTurnStatusV2,
} from '../../types/recordingV2';
import { TimeBasedStance } from '../../types/type';

// POST /api/v2/recordings
// joinCode·deviceToken은 다시 조회할 수 없다.
export interface PostRecordingSessionV2ResponseType {
  sessionKey: string;
  joinCode: string;
  deviceId: string;
  deviceToken: string;
}

// POST /api/v2/recordings/{sessionKey}/devices
// POST /api/v2/recordings/{sessionKey}/host-device
export interface RecordingDeviceV2ResponseType {
  deviceId: string;
  deviceToken: string;
}

// GET /api/v2/recordings/{sessionKey}
export interface GetRecordingSessionV2ResponseType {
  sessionKey: string;
  status: RecordingSessionStatusV2;
  // COMPLETED가 되면 기존 속기록 조회 API로 볼 수 있는 속기록 ID
  transcriptId: number | null;
  errorMessage: string | null;
  turns: RecordingTurnV2Response[];
}

export interface RecordingTurnV2Response {
  turnKey: string;
  timeBoxIndex: number;
  team: TimeBasedStance | null;
  status: RecordingTurnStatusV2;
  candidateCount: number;
  selectedDeviceId: string | null;
  errorMessage: string | null;
}
