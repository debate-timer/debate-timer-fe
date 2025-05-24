import {
  getDebateTableData,
  postDebateTableData,
  putDebateTableData,
} from '../apis/apis/debateTable';
import { PutDebateTableRequestType } from '../apis/requests/debateTable';
import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/debateTable';
import { DebateTableData } from '../type/type';
import { DebateTableRepository } from './DebateTableRepository';

export class ApiDebateTableRepository implements DebateTableRepository {
  async getTable(tableId: number): Promise<GetDebateTableResponseType> {
    return await getDebateTableData(tableId);
  }
  async addTable(data: DebateTableData): Promise<PostDebateTableResponseType> {
    const { info, table } = data;
    return await postDebateTableData({ info, table });
  }
  async editTable(
    data: PutDebateTableRequestType,
  ): Promise<PutDebateTableResponseType> {
    const { id, info, table } = data;
    return await putDebateTableData({ id, info, table });
  }
}
