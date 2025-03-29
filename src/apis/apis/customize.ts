import { CustomizeDebateInfo, CustomizeTimeBoxInfo } from '../../type/type';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import {
  GetCustomizeTableResponseType,
  PatchCustomizeTableResponseType,
  PostCustomizeTableResponseType,
  PutCustomizeTableResponseType,
} from '../responses/customize';

// Template
/*
export async function apiFunc(
  
): Promise<ReturnType> {
    const requestUrl: string = ApiUrl.
    const response = await request<ReturnType>(
        method,
        requestUrl,
        data,
        params,
    );

    return response.data;
}
*/

// GET /api/table/customize/{tableId}
export async function getCustomizeTableData(
  tableId: number,
): Promise<GetCustomizeTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<GetCustomizeTableResponseType>(
    'GET',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}

// POST /api/table/customize
export async function postCustomizeTableData(
  info: CustomizeDebateInfo,
  tables: CustomizeTimeBoxInfo[],
): Promise<PostCustomizeTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PostCustomizeTableResponseType>(
    'POST',
    requestUrl,
    {
      info: {
        name: info.name === '' ? '테이블 1' : info.name,
        agenda: info.agenda,
        warningBell: info.warningBell,
        finishBell: info.finishBell,
      },
      table: tables,
    },
    null,
  );

  return response.data;
}

// PUT /api/table/customize/{tableId}
export async function putCustomizeTableData(
  tableId: number,
  info: CustomizeDebateInfo,
  tables: CustomizeTimeBoxInfo[],
): Promise<PutCustomizeTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PutCustomizeTableResponseType>(
    'POST',
    requestUrl + `/${tableId}`,
    {
      info: {
        name: info.name,
        agenda: info.agenda,
        warningBell: info.warningBell,
        finishBell: info.finishBell,
      },
      table: tables,
    },
    null,
  );

  return response.data;
}

// DELETE /api/table/customize/{tableId}
export async function deleteCustomizeTableData(
  tableId: number,
): Promise<boolean> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request(
    'DELETE',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.status === 204 ? true : false;
}

// PATCH /api/table/customize/{tableId}
export async function patchCustomizeTableData(
  tableId: number,
): Promise<PatchCustomizeTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PatchCustomizeTableResponseType>(
    'PATCH',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}
