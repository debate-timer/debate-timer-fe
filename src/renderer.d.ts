import { UUID } from 'crypto';
import { DebateTableData } from './type/type';

export interface DB_API {
  get: (id: UUID) => Promise<DebateTableData>;
  getAll: () => Promise<DebateTableData[]>;
  post: (item: DebateTableData) => Promise<DebateTableData>;
  delete: (id: UUID) => Promise<DebateTableData[]>;
  patch: (item: DebateTableData) => Promise<DebateTableData>;
}

declare global {
  interface Window {
    db: DB_API;
  }
}
