import { DebateInfo, DebateTable } from '../type/type';

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
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// POST /api/table/parliamentary
export interface PostDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// PUT /api/table/parliamentary/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// DELETE /api/table/parliamentary/{tableId}
// This API only contains HTTP response code 204

// Response types for error cases
export interface ErrorResponseType {
  message: string;
}
