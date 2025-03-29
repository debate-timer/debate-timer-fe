import { CustomizeDebateInfo, CustomizeTimeBoxInfo } from '../../type/type';

// POST /api/table/customize
export interface PostCustomizeTableResponseType {
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

// PUT /api/table/customize/{tableId}
export interface PutCustomizeTableResponseType {
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

// GET /api/table/customize/{tableId}
export interface GetCustomizeTableResponseType {
  id: number;
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

// PATCH /api/table/customize/{tableId}
export interface PatchCustomizeTableResponseType {
  id: number;
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}
