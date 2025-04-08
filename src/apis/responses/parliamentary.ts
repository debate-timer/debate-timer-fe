import {
  ParliamentaryDebateInfo,
  ParliamentaryTimeBoxInfo,
} from '../../type/type';

// GET /api/table/parliamentary/{tableId}
export interface GetTableDataResponseType {
  id: number;
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

// POST /api/table/parliamentary
export interface PostDebateTableResponseType {
  id: number;
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

// PUT /api/table/parliamentary/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

// PATCH /api/table/parliamentary/{tableId}/debate
export interface PatchDebateTableResponseType {
  id: number;
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}
