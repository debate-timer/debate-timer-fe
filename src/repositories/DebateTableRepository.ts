import { PutDebateTableRequestType } from '../apis/requests/debateTable';
import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/debateTable';
import { DebateTableData } from '../type/type';
import { isGuestFlow } from '../util/sessionStorage';
import apiDebateTableRepository from './ApiDebateTableRepository';
import sessionDebateTableRepository from './SessionDebateTableRepository';

export interface DebateTableRepository {
  getTable(tableId?: number): Promise<GetDebateTableResponseType>;
  addTable(data: DebateTableData): Promise<PostDebateTableResponseType>;
  editTable(
    data: PutDebateTableRequestType,
  ): Promise<PutDebateTableResponseType>;
  deleteTable(tableId?: number): Promise<boolean>;
}

export function getRepository(): DebateTableRepository {
  // console.log('# isLoggedIn? ' + isLoggedIn());
  // console.log('# isGuestFlow? ' + isGuestFlow());

  if (isGuestFlow()) return sessionDebateTableRepository;
  return apiDebateTableRepository;
}
