import * as Sentry from '@sentry/react';
import {
  getAuthRevision,
  getMemberId,
  setAccessToken,
} from '../../util/accessToken';
import { assertMemberSettingsAccount } from '../../util/memberSettingsAccount';
import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import {
  GetDebateTableListResponseType,
  GetMemberFeatureFlagsResponseType,
  GetMemberSettingsResponseType,
  PatchMemberSettingsResponseType,
  PostUserResponseType,
} from '../responses/member';
import { PatchMemberSettingsRequestType } from '../requests/member';

// GET /api/member/settings
export async function getMemberSettings(): Promise<GetMemberSettingsResponseType> {
  const identity = assertMemberSettingsAccount(getMemberId());
  const response = await request<GetMemberSettingsResponseType>(
    'GET',
    ApiUrl.memberSettings,
    null,
    null,
    {
      expectedMemberId: identity.memberId,
      expectedAuthRevision: getAuthRevision(),
    },
  );
  return response.data;
}

// PATCH /api/member/settings
export async function patchMemberSettings(
  settings: PatchMemberSettingsRequestType,
): Promise<PatchMemberSettingsResponseType> {
  const identity = assertMemberSettingsAccount(getMemberId());
  const response = await request<PatchMemberSettingsResponseType>(
    'PATCH',
    ApiUrl.memberSettings,
    settings,
    null,
    {
      expectedMemberId: identity.memberId,
      expectedAuthRevision: getAuthRevision(),
    },
  );
  return response.data;
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

  Sentry.setUser({
    id: String(response.data.id),
  });

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

// GET /api/member/feature-flags
export async function getMemberFeatureFlags(): Promise<GetMemberFeatureFlagsResponseType> {
  const requestUrl = `${ApiUrl.member}/feature-flags`;
  const response = await request<GetMemberFeatureFlagsResponseType>(
    'GET',
    requestUrl,
    null,
    null,
  );

  return response.data;
}
