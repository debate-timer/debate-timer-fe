import { DetailDebateInfo, ParliamentaryTimeBoxInfo } from '../../type/type';

// GET /api/table/parliamentary/{tableId}
export interface GetTableDataResponseType {
  id: number;
  info: DetailDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

// POST /api/table/parliamentary
export interface PostDebateTableResponseType {
  id: number;
  info: DetailDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

// PUT /api/table/parliamentary/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: DetailDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}
