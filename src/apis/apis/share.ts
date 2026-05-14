import { request } from '../primitives';
import { ApiUrl } from '../endpoints';
import { GetChairmanTokenResponseType } from '../responses/share';

export const getChairmanToken = (tableId: string) => {
  return request<GetChairmanTokenResponseType>(
    'GET',
    `${ApiUrl.share}/${encodeURIComponent(tableId)}/chairman-token`,
    null,
    null,
  );
};
