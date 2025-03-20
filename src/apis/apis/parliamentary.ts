import {
  ParliamentaryDebateInfo,
  ParliamentaryTimeBoxInfo,
} from '../../type/type';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { PutDebateTableResponseType } from '../responses/parliamentary';
import { PostDebateTableResponseType } from '../responses/parliamentary';
import { GetTableDataResponseType } from '../responses/parliamentary';

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

// GET /api/table/parliamentary/{tableId}
export async function getParliamentaryTableData(
  tableId: number,
): Promise<GetTableDataResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<GetTableDataResponseType>(
    'GET',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}

// GET /api/table/customize/{tableId}
export async function getCustomizeTableData(
  tableId: number,
): Promise<GetCustomizeTableDataResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<GetCustomizeTableDataResponseType>(
    'GET',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}

// POST /api/table/parliamentary
export async function postParliamentaryDebateTable(
  info: ParliamentaryDebateInfo,
  tables: ParliamentaryTimeBoxInfo[],
): Promise<PostDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PostDebateTableResponseType>(
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

// PUT /api/table/parliamentary/{tableId}
export async function putParliamentaryDebateTable(
  tableId: number,
  info: ParliamentaryDebateInfo,
  tables: ParliamentaryTimeBoxInfo[],
): Promise<PutDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PutDebateTableResponseType>(
    'PUT',
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

// DELETE /api/table/parliamentary/{tableId}
export async function deleteParliamentaryDebateTable(
  tableId: number,
): Promise<boolean> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request(
    'DELETE',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.status === 204 ? true : false;
}
