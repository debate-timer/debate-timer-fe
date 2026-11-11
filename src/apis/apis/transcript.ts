import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { PostTranscriptRequestType } from '../requests/transcript';
import {
  GetSharedTranscriptResponseType,
  GetTranscriptResponseType,
  GetTranscriptsResponseType,
  PostTranscriptResponseType,
  PostTranscriptShareResponseType,
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

// POST /api/transcripts/{transcriptId}/share
export async function postTranscriptShare(
  transcriptId: number,
): Promise<PostTranscriptShareResponseType> {
  const requestUrl = `${ApiUrl.transcript}/${encodeURIComponent(transcriptId)}/share`;
  const response = await request<PostTranscriptShareResponseType>(
    'POST',
    requestUrl,
    null,
    null,
  );

  return response.data;
}

// DELETE /api/transcripts/{transcriptId}/share
export async function deleteTranscriptShare(
  transcriptId: number,
): Promise<void> {
  const requestUrl = `${ApiUrl.transcript}/${encodeURIComponent(transcriptId)}/share`;
  await request<void>('DELETE', requestUrl, null, null);
}

// GET /api/shared-transcripts/{shareToken}
export async function getSharedTranscript(
  shareToken: string,
): Promise<GetSharedTranscriptResponseType> {
  const requestUrl = `${ApiUrl.sharedTranscript}/${encodeURIComponent(shareToken)}`;
  const response = await request<GetSharedTranscriptResponseType>(
    'GET',
    requestUrl,
    null,
    null,
  );

  return response.data;
}
