import { request } from '../primitives';
import { ApiUrl } from '../endpoints';
import {
  GetChairmanTokenResponseType,
  GetDebateTableDataForShareResponseType,
} from '../responses/live';

export const getChairmanToken = (tableId: string) => {
  return request<GetChairmanTokenResponseType>(
    'GET',
    `${ApiUrl.live}/${encodeURIComponent(tableId)}/chairman-token`,
    null,
    null,
  );
};

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
