import { DebateInfo, TimeBoxInfo } from '../../type/type';

// POST /api/table/customize
export interface PostCustomizeTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// PUT /api/table/customize/{tableId}
export interface PutCustomizeTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// GET /api/table/customize/{tableId}
export interface GetCustomizeTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

// PATCH /api/table/customize/{tableId}
export interface PatchCustomizeTableResponseType {
  id: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}
