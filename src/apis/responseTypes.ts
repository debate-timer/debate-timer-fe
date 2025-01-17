import { DebateInfo, DebateTable } from '../type/type';

// POST "/api/member"
export interface PostUserResponseType {
  id: number;
  nickname: string;
}

// GET /api/table?memberId={memberId}
export interface GetDebateTableListResponseType {
  tables: DebateTable[];
}

// GET /api/table/parliamentary/{tableId}?memberId={memberId}
export interface GetTableDataResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// POST /api/table/parliamentary?memberId={memberId}
export interface PostDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// PUT /api/table/parliamentary/{tableId}?memberId={memberId}
export interface PutDebateTableResponseType {
  id: number;
  info: {
    name: string;
    agenda: string;
  };
  table: DebateInfo[];
}

// DELETE /api/table/parliamentary/{tableId}?memberId={memberId}
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
