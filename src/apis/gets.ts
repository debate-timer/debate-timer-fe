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

// POST "/api/member"
export async function postUser(
  nickname: string,
): Promise<PostUserResponseType> {
  const requestUrl: string = ApiUrl.member;
  const response = await request<PostUserResponseType>(
    'POST',
    requestUrl,
    {
      nickname: nickname,
    },
    null,
  );

  return response.data;
}

// GET /api/table?memberId={memberId}
export async function getDebateTableList(
  memberId: number,
): Promise<GetDebateTableListResponseType> {
  const requestUrl: string = ApiUrl.table;
  const response = await request<GetDebateTableListResponseType>(
    'GET',
    requestUrl,
    null,
    {
      memberId: memberId,
    },
  );

  return response.data;
}

// GET /api/table/parliamentary/{tableId}?memberId={memberId}
export async function getTableData(
  tableId: number,
  memberId: number,
): Promise<GetTableDataResponseType> {
  const requestUrl: string = ApiUrl.table;
  const response = await request<GetTableDataResponseType>(
    'GET',
    requestUrl,
    null,
    {
      tableId: tableId,
      memberId: memberId,
    },
  );

  return response.data;
}

// POST /api/table/parliamentary?memberId={memberId}
export async function postDebateTable(
  memberId: number,
  tableName: string,
  tableAgenda: string,
  tables: DebateInfo[],
): Promise<PostDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PostDebateTableResponseType>(
    'POST',
    requestUrl,
    {
      info: {
        name: tableName,
        agenda: tableAgenda,
      },
      table: tables,
    },
    {
      memberId: memberId,
    },
  );

  return response.data;
}

// PUT /api/table/parliamentary/{tableId}?memberId={memberId}
export async function putDebateTable(
  memberId: number,
  tableName: string,
  tableAgenda: string,
  tables: DebateInfo[],
): Promise<PutDebateTableResponseType> {
  const requestUrl: string = ApiUrl.parliamentary;
  const response = await request<PutDebateTableResponseType>(
    'PUT',
    requestUrl,
    {
      info: {
        name: tableName,
        agenda: tableAgenda,
      },
      table: tables,
    },
    {
      memberId: memberId,
    },
  );

  return response.data;
}

// DELETE /api/table/parliamentary/{tableId}?memberId={memberId}
export async function deleteDebateTable(
  tableId: number,
  memberId: number,
): Promise<boolean> {
  const requestUrl: string = ApiUrl.member;
  const response = await request('DELETE', requestUrl, null, {
    tableId: tableId,
    memberId: memberId,
  });

  return response.status === 204 ? true : false;
}

// Template
/*
export async function apiFunc(
  
): Promise<ReturnType> {
    const requestUrl: string = ApiUrl.member
    const response = await request<ReturnType>(
        method,
        requestUrl,
        data,
        params,
    );

    return response.data;
}
*/
