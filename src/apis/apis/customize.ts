import { DebateInfo, TimeBoxInfo } from '../../type/type';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import {
  GetDebateTableResponseType,
  PatchDebateTableResponseType,
  PostDebateTableResponseType,
  PutDebateTableResponseType,
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
export async function getDebateTableData(
  tableId: number,
): Promise<GetDebateTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<GetDebateTableResponseType>(
    'GET',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.data;
}

// POST /api/table/customize
export async function postDebateTableData(
  info: DebateInfo,
  tables: TimeBoxInfo[],
): Promise<PostDebateTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PostDebateTableResponseType>(
    'POST',
    requestUrl,
    {
      info: {
        name: info.name === '' ? '시간표 1' : info.name,
        agenda: info.agenda,
        prosTeamName: info.prosTeamName,
        consTeamName: info.consTeamName,
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
export async function putDebateTableData(
  tableId: number,
  info: DebateInfo,
  tables: TimeBoxInfo[],
): Promise<PutDebateTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PutDebateTableResponseType>(
    'PUT',
    requestUrl + `/${tableId}`,
    {
      info: {
        name: info.name,
        agenda: info.agenda,
        prosTeamName: info.prosTeamName,
        consTeamName: info.consTeamName,
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
export async function deleteDebateTableData(tableId: number): Promise<boolean> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request(
    'DELETE',
    requestUrl + `/${tableId}`,
    null,
    null,
  );

  return response.status === 204 ? true : false;
}

// PATCH /api/table/customize/{tableId}/debate
export async function patchDebateTableData(
  tableId: number,
): Promise<PatchDebateTableResponseType> {
  const requestUrl: string = ApiUrl.customize;
  const response = await request<PatchDebateTableResponseType>(
    'PATCH',
    requestUrl + `/${tableId}/debate`,
    null,
    null,
  );

  return response.data;
}
