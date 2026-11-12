import { APIError } from '../apis/primitives';
import { getAccessToken, getMemberId } from './accessToken';

/** 설정 요청이 현재 로그인한 계정의 요청인지 확인함. 회원 ID는 서버에 보내지 않음. */
export function assertMemberSettingsAccount(memberId: string | null) {
  const accessToken = getAccessToken();
  if (!memberId || !accessToken || getMemberId() !== memberId) {
    throw new APIError('MEMBER_SETTINGS_ACCOUNT_CHANGED', 401, null);
  }
  return { memberId };
}
