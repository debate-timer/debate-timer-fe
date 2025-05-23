// src/repositories/SessionCustomizeTableRepository.ts

import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/customize';
import { DebateTableData } from '../type/type';
import {
  getSessionCustomizeTableData,
  setSessionCustomizeTableData,
} from '../util/sessionStorage';
import { DebateTableRepository } from './DebateTableRepository';

export class SessionDebateTableRepository implements DebateTableRepository {
  async getTable(): Promise<GetDebateTableResponseType> {
    return getSessionCustomizeTableData();
  }
  async saveTable(data: DebateTableData): Promise<PostDebateTableResponseType> {
    return setSessionCustomizeTableData(data);
  }
  async editTable(
    data: PutDebateTableResponseType,
  ): Promise<PutDebateTableResponseType> {
    return setSessionCustomizeTableData(data);
  }
}
