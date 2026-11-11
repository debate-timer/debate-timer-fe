import {
  DebateReport,
  SttMode,
  TranscriptLine,
  TranscriptStatus,
} from '../../types/transcript';

// POST /api/transcripts/{tableId}
export interface PostTranscriptResponseType {
  id: number;
}

// GET /api/transcripts/{transcriptId}
export interface GetTranscriptResponseType {
  id: number;
  tableId: number;
  tableName: string;
  agenda: string;
  prosTeamName: string;
  consTeamName: string;
  status: TranscriptStatus;
  sttMode: SttMode;
  // AI가 STT 원문을 다듬는 중이면 true. 끝나거나 실패하면 false이고, 실패하면 원문을 보여준다.
  refining: boolean;
  lines: TranscriptLine[];
  report: DebateReport | null;
  errorMessage: string | null;
  // 공유 링크 토큰. 공유하지 않으면 null이다.
  shareToken: string | null;
}

// POST /api/transcripts/{transcriptId}/share
export interface PostTranscriptShareResponseType {
  shareToken: string;
}

// GET /api/shared-transcripts/{shareToken}
// 로그인 없이 보는 공유 기록이라 시간표 ID·인식 방식·실패 사유는 없다.
export interface GetSharedTranscriptResponseType {
  tableName: string;
  agenda: string;
  prosTeamName: string;
  consTeamName: string;
  status: TranscriptStatus;
  refining: boolean;
  lines: TranscriptLine[];
  report: DebateReport | null;
}

// GET /api/transcripts
// 시간표가 삭제됐으면 tableName·agenda는 null이다.
export interface TranscriptSummary {
  id: number;
  tableId: number;
  tableName: string | null;
  agenda: string | null;
  sttMode: SttMode;
  status: TranscriptStatus;
  refining: boolean;
  createdAt: string;
}

export interface GetTranscriptsResponseType {
  transcripts: TranscriptSummary[];
}
