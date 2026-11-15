import { RecordingQualityMetricsV2 } from '../../types/recordingV2';
import { TimeBasedStance } from '../../types/type';

// POST /api/v2/recordings
export interface PostRecordingSessionV2RequestType {
  tableId: number;
  // 음성 인식 언어(ko-KR, en-US 등)
  language: string | null;
}

// POST /api/v2/recordings/{sessionKey}/devices
export interface PostRecordingDeviceV2RequestType {
  joinCode: string;
}

// POST /api/v2/recordings/{sessionKey}/turns/{turnKey}
// multipart 폼 값. 품질 지표를 재지 못했으면 metrics를 null로 보낸다.
export interface PostRecordingTurnV2RequestType {
  audio: Blob;
  fileName: string;
  timeBoxIndex: number;
  // 자유토론처럼 한 타임박스 안에서 발언 팀이 바뀌는 경우의 발언 팀
  team: TimeBasedStance | null;
  durationMs: number;
  // 녹음을 시작한 시각(서버 시계 기준 epoch ms)
  startedAtEpochMs: number;
  metrics: RecordingQualityMetricsV2 | null;
}
