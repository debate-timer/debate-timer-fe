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
    warningBell: boolean;
    finishBell: boolean;
  };
  table: DebateInfo[];
}

// POST /api/table/parliamentary
export interface PostDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
    warningBell: boolean;
    finishBell: boolean;
  };
  table: DebateInfo[];
}

// PUT /api/table/parliamentary/{tableId}
export interface PutDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
    warningBell: boolean;
    finishBell: boolean;
  };
  table: DebateInfo[];
}

// DELETE /api/table/parliamentary/{tableId}
// This API only contains HTTP response code 204

// Response types for error cases
export interface ErrorResponseType {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  message: string;
}
