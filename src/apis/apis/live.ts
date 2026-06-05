import { request } from '../primitives';
import { ApiUrl } from '../endpoints';
import { GetChairmanTokenResponseType } from '../responses/live';

export const getChairmanToken = (tableId: string) => {
  return request<GetChairmanTokenResponseType>(
    'GET',
    `${ApiUrl.live}/${encodeURIComponent(tableId)}/chairman-token`,
    null,
    null,
  );
};
