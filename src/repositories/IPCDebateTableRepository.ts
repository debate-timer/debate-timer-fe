import { DebateTableData } from '../type/type';
import { UUID } from 'crypto';

// Interface for IPC-based repository
class IPCDebateTableRepository {
  // Get 1 item
  async getTable(id: UUID): Promise<DebateTableData> {
    return await window.db.get(id);
  }

  // Get all items
  async getAllTables(): Promise<DebateTableData[]> {
    return await window.db.getAll();
  }

  // Create a new item
  async postTable(item: DebateTableData): Promise<DebateTableData> {
    return await window.db.post(item);
  }

  // Delete the item
  async deleteTable(id: UUID): Promise<DebateTableData[]> {
    return await window.db.delete(id);
  }

  // Modify the existing item
  async patchTable(item: DebateTableData): Promise<DebateTableData> {
    return await window.db.post(item);
  }
}

// Create singleton instance and expose it only
const fileDebateTableRepository = new IPCDebateTableRepository();
export default fileDebateTableRepository;
