import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { PostTranscriptRequestType } from '../requests/transcript';
import {
  GetTranscriptResponseType,
  GetTranscriptsResponseType,
  PostTranscriptResponseType,
} from '../responses/transcript';

// POST /api/transcripts/{tableId}
export async function postTranscript(
  tableId: number,
  body: PostTranscriptRequestType,
): Promise<PostTranscriptResponseType> {
  const requestUrl = `${ApiUrl.transcript}/${encodeURIComponent(tableId)}`;
  const response = await request<PostTranscriptResponseType>(
    'POST',
    requestUrl,
    body,
    null,
  );

  return response.data;
}

// GET /api/transcripts/{transcriptId}
export async function getTranscript(
  transcriptId: number,
): Promise<GetTranscriptResponseType> {
  const requestUrl = `${ApiUrl.transcript}/${encodeURIComponent(transcriptId)}`;
  const response = await request<GetTranscriptResponseType>(
    'GET',
    requestUrl,
    null,
    null,
  );

  return response.data;
}

// GET /api/transcripts
export async function getTranscripts(): Promise<GetTranscriptsResponseType> {
  const response = await request<GetTranscriptsResponseType>(
    'GET',
    ApiUrl.transcript,
    null,
    null,
  );

  return response.data;
}
