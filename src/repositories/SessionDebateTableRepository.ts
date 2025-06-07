// src/repositories/SessionCustomizeTableRepository.ts

import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/debateTable';
import { DebateTableData } from '../type/type';
import {
  deleteSessionCustomizeTableData,
  getSessionCustomizeTableData,
  setSessionCustomizeTableData,
} from '../util/sessionStorage';
import { DebateTableRepository } from './DebateTableRepository';

class SessionDebateTableRepository implements DebateTableRepository {
  async getTable(): Promise<GetDebateTableResponseType> {
    return getSessionCustomizeTableData();
  }

  async addTable(data: DebateTableData): Promise<PostDebateTableResponseType> {
    return setSessionCustomizeTableData(data);
  }

  async editTable(
    data: PutDebateTableResponseType,
  ): Promise<PutDebateTableResponseType> {
    return setSessionCustomizeTableData(data);
  }

  async deleteTable(): Promise<boolean> {
    deleteSessionCustomizeTableData();
    return true;
  }
}

// Singleton
const sessionDebateTableRepository = new SessionDebateTableRepository();
export default sessionDebateTableRepository;
