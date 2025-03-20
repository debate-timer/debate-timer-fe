import {
  TimeBoxInfo,
  DebateTable,
  DetailDebateInfo,
  CustomizeDetailDebateInfo,
  CustomizeTimeBoxInfo,
} from '../type/type';

// POST "/api/member"
export interface PostUserResponseType {
  id: number;
  email: string;
}

// GET /api/table
export interface GetDebateTableListResponseType {
  tables: DebateTable[];
}

// GET /api/table/parliamentary/{tableId}
export interface GetTableDataResponseType {
  id: number;
  info: DetailDebateInfo;
  table: TimeBoxInfo[];
}

// GET /api/table/Customize/{tableId}
export interface GetCustomizeTableDataResponseType {
  id: number;
  info: CustomizeDetailDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

// POST /api/table/parliamentary
export interface PostDebateTableResponseType {
  id: number;
  info: DetailDebateInfo;
  table: TimeBoxInfo[];
}

// PUT /api/table/parliamentary/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: DetailDebateInfo;
  table: TimeBoxInfo[];
}

// DELETE /api/table/parliamentary/{tableId}
// This API only contains HTTP response code 204

// Response types for error cases
export interface ErrorResponseType {
  message: string;
}
