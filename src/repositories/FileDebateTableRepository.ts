import { DebateTableData } from '../type/type';
import { UUID } from 'crypto';

class FileDebateTableRepository {
  async getTable(id: UUID): Promise<DebateTableData> {
    return await window.db.get(id);
  }

  async getAllTables(): Promise<DebateTableData[]> {
    return await window.db.getAll();
  }

  async postTable(item: DebateTableData): Promise<DebateTableData> {
    return await window.db.post(item);
  }

  async deleteTable(id: UUID): Promise<DebateTableData[]> {
    return await window.db.delete(id);
  }

  async patchTable(item: DebateTableData): Promise<DebateTableData> {
    return await window.db.post(item);
  }
}

const fileDebateTableRepository = new FileDebateTableRepository();
export default fileDebateTableRepository;
