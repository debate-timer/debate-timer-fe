import { FeatureFlag } from '../types/featureFlag';
import { useGetMemberFeatureFlags } from './query/useGetMemberFeatureFlags';

interface UseFeatureFlagOptions {
  enabled?: boolean;
}

/**
 * 로그인한 회원에게 피쳐 플래그가 부여됐는지 알려준다.
 * 조회 중이거나 조회에 실패하면 사용할 수 없는 것으로 보고, 조회하지 않도록 하면 요청하지 않는다.
 */
export default function useFeatureFlag(
  flag: FeatureFlag,
  options: UseFeatureFlagOptions = {},
) {
  const { enabled = true } = options;
  const { data, isLoading } = useGetMemberFeatureFlags(enabled);

  return {
    isEnabled: enabled && (data?.featureFlags.includes(flag) ?? false),
    isLoading: enabled && isLoading,
  };
}
