import { PutDebateTableRequestType } from '../apis/requests/debateTable';
import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/debateTable';
import { DebateTableData } from '../type/type';
import { isLoggedIn } from '../util/accessToken';
import apiDebateTableRepository from './ApiDebateTableRepository';
import sessionDebateTableRepository from './SessionDebateTableRepository';

export interface DebateTableRepository {
  getTable(tableId?: number): Promise<GetDebateTableResponseType>;
  addTable(data: DebateTableData): Promise<PostDebateTableResponseType>;
  editTable(
    data: PutDebateTableRequestType,
  ): Promise<PutDebateTableResponseType>;
}

export function getRepository(): DebateTableRepository {
  console.log('# isLoggedIn? ' + isLoggedIn());

  if (isLoggedIn()) return apiDebateTableRepository;
  return sessionDebateTableRepository;
}
