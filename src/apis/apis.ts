import { request } from './primitives';
import { ApiUrl } from './endpoints';
import {
  GetDebateTableListResponseType,
  GetTableDataResponseType,
  PostDebateTableResponseType,
  PostUserResponseType,
  PutDebateTableResponseType,
} from './responseTypes';
import { DebateInfo } from '../type/type';
import { setAccessToken } from '../util/accessToken';

// String type identifier for TanStack Query's 'useQuery' function
export const queryKeyIdentifier = {
  getDebateTableList: 'DebateTableList',
  getParliamentaryTableData: 'ParliamentaryTableData',
};

// POST "/api/member"
export async function postUser(code: string): Promise<PostUserResponseType> {
  const requestUrl: string = ApiUrl.member;
  const response = await request<PostUserResponseType>(
    'POST',
    requestUrl,
    { code, redirectUrl: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI },
    null,
  );
  // 응답 헤더에서 Authorization 값을 추출합니다.
  const authHeader = response.headers['authorization'];

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    setAccessToken(token);
  } else {
    throw new Error('Authorization 헤더가 존재하지 않습니다.');
  }

  return response.data;
}

// GET /api/table
export async function getDebateTableList(): Promise<GetDebateTableListResponseType> {
  const requestUrl: string = ApiUrl.table;
  const response = await request<GetDebateTableListResponseType>(
    'GET',
    requestUrl,
    null,
    null,
  );

  return response.data;
}

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

// POST /api/table/parliamentary
export async function postParliamentaryDebateTable(
  tableName: string,
  tableAgenda: string,
  warningBell: boolean,
  finishBell: boolean,
  tables: DebateInfo[],
): Promise<PostDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PostDebateTableResponseType>(
    'POST',
    requestUrl,
    {
      info: {
        name: tableName === '' ? '테이블 1' : tableName,
        agenda: tableAgenda,
        warningBell: warningBell,
        finishBell: finishBell,
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
  tableName: string,
  tableAgenda: string,
  warningBell: boolean,
  finishBell: boolean,
  tables: DebateInfo[],
): Promise<PutDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PutDebateTableResponseType>(
    'PUT',
    requestUrl + `/${tableId}`,
    {
      info: {
        name: tableName,
        agenda: tableAgenda,
        warningBell: warningBell,
        finishBell: finishBell,
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

export async function logout(): Promise<boolean> {
  const requestUrl: string = ApiUrl.member;
  const response = await request('POST', requestUrl + `/logout`, null, null);

  return response.status === 204 ? true : false;
}
