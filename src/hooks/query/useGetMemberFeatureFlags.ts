import { useQuery } from '@tanstack/react-query';
import { getMemberFeatureFlags } from '../../apis/apis/member';
import { GetMemberFeatureFlagsResponseType } from '../../apis/responses/member';

export const MEMBER_FEATURE_FLAGS_QUERY_KEY = ['MemberFeatureFlags'];

// 로그인한 회원의 피쳐 플래그. 조회에 실패하면 화면을 깨지 않고 플래그가 없는 것으로 다룬다.
export function useGetMemberFeatureFlags(enabled: boolean) {
  return useQuery<GetMemberFeatureFlagsResponseType>({
    queryKey: MEMBER_FEATURE_FLAGS_QUERY_KEY,
    queryFn: getMemberFeatureFlags,
    enabled,
    throwOnError: false,
  });
}
