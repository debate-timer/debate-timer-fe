import { setAccessToken } from '../../util/accessToken';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { GetDebateTableListResponseType } from '../responses/member';
import { PostUserResponseType } from '../responses/member';

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

// POST /api/member
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

// POST /api/member/logout
export async function logout(): Promise<boolean> {
  const requestUrl: string = ApiUrl.member;
  const response = await request('POST', requestUrl + `/logout`, null, null);

  return response.status === 204 ? true : false;
}
