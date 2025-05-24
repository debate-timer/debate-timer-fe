import { DebateTableData } from '../../type/type';

// POST /api/table/customize
export interface PostDebateTableResponseType extends DebateTableData {
  id: number;
}

// PUT /api/table/customize/{tableId}
export interface PutDebateTableResponseType extends DebateTableData {
  id: number;
}

// GET /api/table/customize/{tableId}
export interface GetDebateTableResponseType extends DebateTableData {
  id: number;
}

// GET /api/table/customize/{tableId}
export interface GetDebateTableResponseType extends DebateTableData {
  id: number;
}

// PATCH /api/table/customize/{tableId}

export interface PatchDebateTableResponseType extends DebateTableData {
  id: number;
}
