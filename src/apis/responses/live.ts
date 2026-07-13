import { DebateTableData } from '../../type/type';

export interface GetChairmanTokenResponseType {
  chairmanToken: string;
}

// GET /api/live/table/customize/{tableId}
export interface GetDebateTableDataForShareResponseType extends DebateTableData {
  id: number;
}
