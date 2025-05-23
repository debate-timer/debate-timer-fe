import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/customize';
import { DebateTableData } from '../type/type';
import { isGuestFlow } from '../util/sessionStorage';
import { ApiDebateTableRepository } from './ApiDebateTableRepository';
import { SessionDebateTableRepository } from './SessionDebateTableRepository';
export interface DebateTableRepository {
  getTable(tableId?: number): Promise<GetDebateTableResponseType>;
  saveTable(data: DebateTableData): Promise<PostDebateTableResponseType>;
  editTable(
    data: PutDebateTableResponseType,
  ): Promise<PutDebateTableResponseType>;
}

export function getRepository(): DebateTableRepository {
  console.log(isGuestFlow());
  if (isGuestFlow()) return new SessionDebateTableRepository();
  return new ApiDebateTableRepository();
}
