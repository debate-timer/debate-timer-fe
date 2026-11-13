import { useQuery } from '@tanstack/react-query';
import { getMemberSettings } from '../../apis/apis/member';
import { getAccessToken, getMemberId } from '../../util/accessToken';
import { assertMemberSettingsAccount } from '../../util/memberSettingsAccount';

export function memberSettingsQueryKey(memberId: string | null) {
  return ['MemberSettings', memberId] as const;
}

/** 본인 설정은 계정별 최초 조회와 명시적 재시도만 수행함. */
export default function useGetMemberSettings(memberId: string | null) {
  return useQuery({
    queryKey: memberSettingsQueryKey(memberId),
    queryFn: () => {
      assertMemberSettingsAccount(memberId);
      return getMemberSettings();
    },
    enabled: !!memberId && !!getAccessToken() && getMemberId() === memberId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: false,
    throwOnError: false,
  });
}
