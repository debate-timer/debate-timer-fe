import { CreatePollInfo, PollInfo, VoterPollInfo } from '../../type/type';

// POST /api/polls/{tableId}
export interface PostCreatePollResponseType extends CreatePollInfo {
  id: number;
}

// GET /api/polls/{pollId}
export interface GetPollResponseType extends PollInfo {
  id: string;
}

// PATCH /api/polls/{pollId}
export interface PatchPollResponseType extends PollInfo {
  id: number;
}

// GET /api/polls/{pollId}/votes
export interface GetVoterPollInfoResponseType extends PollInfo {
  id: number;
  participateCode: string;
}

// POST /api/polls/{pollId}/votes

export interface PostVoterPollInfoResponseType extends VoterPollInfo {
  id: number;
}
