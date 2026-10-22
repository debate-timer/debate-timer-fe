import { SpeechSegment } from '../../types/transcript';

// POST /api/transcripts/{tableId}
export interface PostTranscriptRequestType {
  segments: SpeechSegment[];
}
