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
