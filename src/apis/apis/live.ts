import { request } from '../primitives';
import { ApiUrl } from '../endpoints';
import {
  GetChairmanTokenResponseType,
  GetDebateTableDataForShareResponseType,
} from '../responses/live';

// GET /api/live/{tableId}/chairman-token
export async function getChairmanToken(
  tableId: string,
): Promise<GetChairmanTokenResponseType> {
  const response = await request<GetChairmanTokenResponseType>(
    'GET',
    `${ApiUrl.live}/${encodeURIComponent(tableId)}/chairman-token`,
    null,
    null,
  );

  return response.data;
}

// GET /api/live/table/customize/{tableId}
export async function getDebateTableDataForShare(
  tableId: number,
): Promise<GetDebateTableDataForShareResponseType> {
  const response = await request<GetDebateTableDataForShareResponseType>(
    'GET',
    `${ApiUrl.live}/table/customize/${tableId}`,
    null,
    null,
  );

  return response.data;
}
