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
  lines: TranscriptLine[];
  report: DebateReport | null;
  errorMessage: string | null;
}
