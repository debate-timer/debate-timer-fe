import { VoterPollInfo } from '../../type/type';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import {
  GetPollResponseType,
  GetVoterPollInfoResponseType,
  PatchPollResponseType,
  PostCreatePollResponseType,
  PostVoterPollInfoResponseType,
} from '../responses/poll';

// Template
/*
export async function apiFunc(
  
): Promise<ReturnType> {
    const requestUrl: string = ApiUrl.
    const response = await request<ReturnType>(
        method,
        requestUrl,
        data,
        params,
    );

    return response.data;
}
*/

// POST /api/polls/{tableId}
export async function postCreatePoll(
  tableId: number,
): Promise<PostCreatePollResponseType> {
  const requestUrl: string = ApiUrl.poll;
  const response = await request<PostCreatePollResponseType>(
    'POST',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}

// GET /api/polls/{pollId}
export async function getPollInfo(
  pollId: number,
): Promise<GetPollResponseType> {
  const requestUrl: string = ApiUrl.poll;
  const response = await request<GetPollResponseType>(
    'GET',
    requestUrl + `/${pollId}`,
    null,
    null,
  );
  return response.data;
}

// PATCH /api/polls/{pollId}
export async function patchEndPoll(
  pollId: number,
): Promise<PatchPollResponseType> {
  const requestUrl: string = ApiUrl.poll;
  const response = await request<PatchPollResponseType>(
    'PATCH',
    requestUrl + `/${pollId}`,
    null,
    null,
  );
  return response.data;
}

// GET /api/polls/{pollId}/votes
export async function getVoterPollInfo(
  pollId: number,
): Promise<GetVoterPollInfoResponseType> {
  const requestUrl: string = ApiUrl.poll;
  const response = await request<GetVoterPollInfoResponseType>(
    'GET',
    requestUrl + `/${pollId}/votes`,
    null,
    null,
  );

  return response.data;
}

// POST /api/polls/{pollId}/votes
export async function postVoterPollInfo(
  pollId: number,
  voterInfo: VoterPollInfo,
): Promise<PostVoterPollInfoResponseType> {
  const requestUrl: string = ApiUrl.poll;
  const response = await request<PostVoterPollInfoResponseType>(
    'POST',
    requestUrl + `/${pollId}/votes`,
    voterInfo,
    null,
  );

  return response.data;
}
