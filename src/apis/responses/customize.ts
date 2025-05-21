import { DebateInfo, TimeBoxInfo } from '../../type/type';

// POST /api/table/customize
export interface PostDebateTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// PUT /api/table/customize/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// GET /api/table/customize/{tableId}
export interface GetDebateTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// PATCH /api/table/customize/{tableId}
export interface PatchDebateTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}
