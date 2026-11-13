import { BasePollInfo, PollInfo, VoterPollInfo } from '../../types/type';

// POST /api/polls/{tableId}
export interface PostPollResponseType extends BasePollInfo {
  id: number;
}

// GET /api/polls/{pollId}
export interface GetPollResponseType extends PollInfo {
  id: number;
}

// PATCH /api/polls/{pollId}
export interface PatchPollResponseType extends PollInfo {
  id: number;
}

// GET /api/polls/{pollId}/votes
export interface GetVoterPollInfoResponseType extends BasePollInfo {
  id: number;
  participateCode: string;
  totalCount: number;
  prosCount: number;
  consCount: number;
  tableInfo: {
    name: string;
    agenda: string;
  };
}

// POST /api/polls/{pollId}/votes

export interface PostVoterPollInfoResponseType extends VoterPollInfo {
  id: number;
}
