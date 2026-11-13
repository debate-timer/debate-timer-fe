import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchMemberSettings } from '../../apis/apis/member';
import { PatchMemberSettingsRequestType } from '../../apis/requests/member';
import {
  getAccessToken,
  getAuthRevision,
  getMemberId,
} from '../../util/accessToken';
import { assertMemberSettingsAccount } from '../../util/memberSettingsAccount';
import { memberSettingsQueryKey } from '../query/useGetMemberSettings';

/** 서버가 확정한 설정을 현재 요청 계정의 캐시에만 반영함. 저장 순서는 호출자가 소유함. */
export default function usePatchMemberSettings(memberId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: memberSettingsQueryKey(memberId),
    onMutate: () => ({
      ...assertMemberSettingsAccount(memberId),
      revision: getAuthRevision(),
    }),
    mutationFn: (settings: PatchMemberSettingsRequestType) => {
      assertMemberSettingsAccount(memberId);
      return patchMemberSettings(settings);
    },
    onSuccess: async (settings, _variables, identity) => {
      if (!identity) {
        return;
      }
      // 이전 세션 응답은 현재 세션의 조회 취소에도 관여하지 않게 함.
      if (
        !getAccessToken() ||
        getMemberId() !== identity.memberId ||
        getAuthRevision() !== identity.revision
      ) {
        return;
      }
      const queryKey = memberSettingsQueryKey(identity.memberId);
      // 저장 전 조회의 지연 응답이 최종 저장값을 덮어쓰지 못하게 함.
      await queryClient.cancelQueries({ queryKey, exact: true });
      if (
        !getAccessToken() ||
        getMemberId() !== identity.memberId ||
        getAuthRevision() !== identity.revision
      ) {
        return;
      }
      queryClient.setQueryData(queryKey, settings);
    },
    retry: false,
    throwOnError: false,
  });
}
