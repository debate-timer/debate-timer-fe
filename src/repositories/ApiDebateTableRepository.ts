import {
  getDebateTableData,
  postDebateTableData,
  putDebateTableData,
} from '../apis/apis/customize';
import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
} from '../apis/responses/customize';
import { DebateTableRepository } from './DebateTableRepository';

export class ApiDebateTableRepository implements DebateTableRepository {
  async getTable(tableId: number): Promise<GetDebateTableResponseType> {
    return await getDebateTableData(tableId);
  }
  async saveTable(
    data: GetDebateTableResponseType,
  ): Promise<PostDebateTableResponseType> {
    return await postDebateTableData(data.info, data.table);
  }
  async editTable(
    data: PutDebateTableResponseType,
  ): Promise<PutDebateTableResponseType> {
    return await putDebateTableData(data.id, data.info, data.table);
  }
}
