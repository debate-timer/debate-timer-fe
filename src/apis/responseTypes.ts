import { TimeBoxInfo, DebateTable } from '../type/type';

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
  table: TimeBoxInfo[];
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
  table: TimeBoxInfo[];
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
  table: TimeBoxInfo[];
}

// DELETE /api/table/parliamentary/{tableId}
// This API only contains HTTP response code 204

// Response types for error cases
export interface ErrorResponseType {
  message: string;
}
